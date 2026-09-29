import { getExceptions } from "./exceptions";
import { mapTaskFromException } from "@/lib/supabase/mappers";
import type { TaskRecord } from "@/lib/types";

export async function getTasks(clientId: string): Promise<TaskRecord[]> {
  const exceptions = await getExceptions(clientId);
  return exceptions.map(mapTaskFromException).filter((t): t is TaskRecord => t !== null);
}
