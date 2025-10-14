import { Permission } from "../types/permissionType.ts"
import config from '../config/indexConfig.ts'

export function getKeyPermission(key: string | undefined): Permission | null {
  if (key === config.apiKeys.full) return 'full'
  if (key === config.apiKeys.write) return 'write'
  if (key === config.apiKeys.read) return 'read'
  return null
}