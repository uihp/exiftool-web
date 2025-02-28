FROM guergeiro/pnpm:lts-latest-alpine

# Install dependencies
WORKDIR /app
COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy all local files into the image.
COPY ./frontend/. .

# This makes svelte's adapter-auto think that we are in a
# Google Cloud Run environment, which makes it pick adapter-node
ENV GCP_BUILDPACKS="1"

# Build app
RUN pnpm run build

# Expose default node port (3000)
EXPOSE 3000

# Launch with dotenv config
CMD ["node", "./build"]
