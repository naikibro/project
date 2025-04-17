# Microservice project

## Tech stack

- docker and docker compose
- NestJS
- NextJS
- Postgres
- RabbitMQ

# Features

- Microservice architecture
- Message broker between microservices
- Auth ( Credentials and Oauth2 strategies )
- NextJs frontend

## Architecture overview

```mermaid
graph TD
A1@{ shape: processes, label: "core backend" }
B[frontend]
C[RabbitMq]
db1[(auth service db)]
db2[(test db)]

A1 --> db1
A1 --> db2

B --> A1
A1 <--> C
```

## Run the project

copy and fill the env variables

```sh
cp .env.example .env
```

Launch the services

```sh
docker compose up --build -d
```

### About the authors

## [<img src="https://github.com/naikibro.png" width="100px;"/><br /><sub><a href="https://github.com/naikibro">Vaanaiki Brotherson</a></sub>](https://github.com/naikibro)

🚀 **Happy Coding!**
