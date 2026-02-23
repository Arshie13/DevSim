import Dockerode from 'dockerode';
import { docker } from '$lib/server/docker/client';

interface ContainerResponse {
  success: boolean;
  error?: string;
  container?: Dockerode.Container;
}

export async function getContainerById(containerId: string): Promise<ContainerResponse> {
  try {
    const container = docker.getContainer(containerId);
    // Check if container exists by inspecting it
    const info = await container.inspect();

    // If the container is not running, start it
    if (!info.State.Running) {
      return {
        success: false,
        error: `Container with ID ${containerId} is not running. Please start the container before accessing it.`
      }
    }

    return {
      success: true,
      container
    }
  } catch (e) {
    console.error(`Error fetching container with ID ${containerId}:`, e);
    return {
      success: false,
      error: `Container with ID ${containerId} not found or could not be started.`
    };
  }
}
