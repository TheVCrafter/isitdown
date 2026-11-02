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
- A deployment workflow connects to the server over SSH, sets up the runtime (Docker, a data folder, an environment file), pulls the image and starts the container (#23).
- After the start, the workflow calls a health endpoint and fails if the application does not answer (#24).
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

- The SSH key pair was created for this deployment only. The public key is on the server, and the private key will be stored as a GitHub secret (#23). The server address is also a secret and is not written into the repository.
- Memory is small. The Docker image should stay small, and the runtime setup should add a swap file so installing and running containers does not run out of memory (#23).
- The history page listens on port 3000. The port has to be opened in the cloud network rules and in the server's own firewall (#23). The page has no login, so anyone who can reach the port can read the history.
- Oracle can reclaim a free VM that stays idle for seven days. This app uses very little CPU and network, so this can happen. Because the pipeline sets up the runtime itself, a lost server can be replaced by creating a new VM and running the deployment again. The stored results would be lost, since the database lives on the server.
