app = "thattoo-app"  # change this to your desired Fly.io app name
primary_region = "lhr"  # London region, change if needed

[build]
  image = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[experimental]
  allowed_public_ports = [3000]
  auto_rollback = true

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = "80"       # HTTP port
    handlers = ["http"]

  [[services.ports]]
    port = "443"      # HTTPS port
    handlers = ["tls", "http"]
 
