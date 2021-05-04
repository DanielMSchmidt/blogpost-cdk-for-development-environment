FROM node:alpine
WORKDIR /usr/src/app
RUN yarn global add serve

COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]
