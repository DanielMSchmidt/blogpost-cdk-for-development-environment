import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Container, Image, DockerProvider } from "./.gen/providers/docker";
import { resolve } from "path";

const USE_LOCAL_APP = Boolean(process.env.USE_LOCAL_APP);
const ENVIRONMENT = process.env.ENVIRONMENT || "development";

function externalApi(scope: Construct): string {
  switch (ENVIRONMENT) {
    case "production":
      return "https://api.artic.edu/api/v1/artworks";
    case "legacy":
      return "https://api.artic.edu/api/legacy/artworks";
    case "staging":
      return "https://staging.api.artic.edu/api/v1/artworks";
    case "development":
      const port = 3001;

      new Container(scope, "external-api", {
        name: "external-api",
        image: "nginx:latest",
        ports: [{ external: port, internal: 80 }],
      });
      return "http://localhost:" + port;
    default:
      throw "Unknown ENVIRONMENT, use production, legacy, staging, or development";
  }
}

function application(name: string, dockerImageName: string, path: string) {
  return function (
    scope: Construct,
    env: Record<string, string>,
    ports: Record<number, number>
  ) {
    const image = new Image(scope, `${name}-image`, {
      name: dockerImageName,
      buildAttribute: [
        { path: path, forceRemove: true, tag: dockerImageName.split(":") },
      ],
    });

    new Container(scope, `${name}-container`, {
      name,
      image: image.name,
      env: Object.entries(env).map(([k, v]) => `${k}=${v}`),
      ports: Object.entries(ports).map(([k, v]) => ({
        internal: parseInt(k, 10),
        external: v,
      })),
      ...(USE_LOCAL_APP
        ? {
            mounts: [
              {
                source: resolve(path, "src"),
                target: "/src",
                type: "bind",
              },
            ],
          }
        : {}),
    });
  };
}

const backendApp = application(
  "backend",
  "danielmschmidt/backend:latest",
  resolve(__dirname, "../../backend")
);

const frontendApp = application(
  "frontend",
  "danielmschmidt/frontend:latest",
  resolve(__dirname, "../../frontend")
);

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);
    new DockerProvider(this, "provider", {});

    const externalApiUrl = externalApi(this);
    backendApp(this, { EXTERNAL_API_URL: externalApiUrl }, { 3000: 3000 });
    frontendApp(this, {}, { 80: 1234 });
  }
}

const app = new App();
new MyStack(app, "dev-environment");
app.synth();
