# Hosting

The application is a long-running process: it checks websites on an interval, keeps its results in a SQLite file, and serves a history page. It therefore needs a place that runs continuously and keeps a folder of data between restarts.

## Options

| Option                                 | Runs continuously   | Keeps the SQLite file    | Pipeline sets up the runtime | Cost                                             |
| -------------------------------------- | ------------------- | ------------------------ | ---------------------------- | ------------------------------------------------ |
| Docker container on a server over SSH  | Yes                 | Yes, in a mounted folder | Yes                          | Free tier or a small VPS                         |
| Container platform (PaaS)              | Yes                 | Only with a paid disk    | Partly, the platform does it | Depends on the platform                          |
| Own computer with a self-hosted runner | Only while it is on | Yes                      | Yes                          | None, but a security risk on a public repository |
| GitHub Pages                           | Not applicable      | Not applicable           | Not applicable               | Static files only, cannot run the monitor        |

## Decision

Deploy a Docker container to a Linux server over SSH.

- The pipeline builds a versioned Docker image and publishes it to the GitHub container registry (#22).
- A deployment job in the release workflow connects to the server over SSH, sets up the runtime (a swap file and Docker), pulls the image of the released version and starts the container with a data volume (#23).
- After the start, the deploy job calls the health endpoint from outside and fails the deployment if the application does not answer as healthy (#24).
- Configuration is passed through environment variables, and credentials are stored as GitHub secrets, never in the repository.

## Server

The server is a virtual machine in the free tier of Oracle Cloud (Always Free), in the Zurich region.

| Property     | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Shape        | VM.Standard.E2.1.Micro (AMD, 1 core, 1 GB memory)        |
| System       | Ubuntu 24.04 LTS, `x86_64`                               |
| Memory       | About 950 MB in total, about 720 MB available, no swap   |
| Login        | SSH as the user `ubuntu`, with a key used only for this  |
| Architecture | `x86_64`, so the Docker image does not need an ARM build |

The AMD shape was chosen on purpose. The ARM shape of the free tier would need an image built for ARM as well, which adds work to the pipeline.

## Consequences

- The SSH key pair was created for this deployment only. The public key is on the server, and the private key is stored as a GitHub secret, together with the server address, the login user and the server's host key. None of them is written into the repository.
- Memory is small. The Docker image is built in two stages to stay small, and the deployment script adds a swap file so installing and running containers does not run out of memory.
- The history page listens on port 3000. The port is opened for the internet in the cloud network rules of the server. The page has no login, so anyone who can reach the port can read the uptime data of the monitored websites, which are public ones.
- Oracle can reclaim a free VM that stays idle for seven days. This app uses very little CPU and network, so this can happen. Because the pipeline sets up the runtime itself, a lost server can be replaced by creating a new VM, entering its address in the secrets, and running the deployment again with a new tag. The stored results would be lost, since the database lives on the server.
