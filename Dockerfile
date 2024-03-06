FROM node:latest as build-stage

ARG REACT_APP_API_ENDPOINT
ENV REACT_APP_API_ENDPOINT=$REACT_APP_API_ENDPOINT

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:latest as serve-stage

RUN npm install -g serve

WORKDIR /app

COPY --from=build-stage /app/build /app

EXPOSE 17466

CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:17466"]
