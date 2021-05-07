# Blogpost: Declarative Development Environments with CDK

This repo is the base for a blog post I am about to write on how to use the [Terraform CDK](https://github.com/hashicorp/terraform-cdk) to create a docker-based development environment for your team.
See [`environment/dev/main.ts`](environment/main.ts) for the implementation.

## Usage

Please ensure you have terraform >= v0.14 installed and a recent version of docker.

```sh
npm install
npm start # creates environment
npm stop # destroys environment
```

### Environment Variables

One of the benefits of this approach is that we can make the configuration of our setup easy while making the [implementation](environment/main.ts) readable.

- `ENVIRONMENT`: "production" | "staging" | "legacy" | "development" (default is development)
- `USE_LOCAL_APP`: if truthy it symlinks the folders of the apps inside the docker container

## License

MIT
