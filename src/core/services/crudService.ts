import { FastifyInstance } from 'fastify'
import { GenericResponse } from '../../types/responseType.ts'
import { buildFiltersToRaw } from '../../utils/buildQueryFilters.ts'
import config from '../../config/indexConfig.ts'

export const createRecord = async (
  app: FastifyInstance,
  table: string,
  data: any
): Promise<GenericResponse<any[] | null>> => {
  try {
    const result = await app.db(table).insert(data).returning('*')

    return {
      status: 'success',
      data: result,
      code: 200,
    }
  } catch (error: any) {
    app.log.error(error)
    return {
      status: 'error',
      code: 400,
      error: error.message || 'An error occurred while creating the record',
    }
  }
}

export const readRecords = async (
  app: FastifyInstance,
  table: string,
  query: Record<string, string>
): Promise<GenericResponse<any | null>> => {
  try {
    const { rawSql, bindings } = buildFiltersToRaw(table, query, config.dbClient)
    const result = await app.db.raw(rawSql, bindings)


    let dataResult;

    if (Array.isArray(result)) {
      dataResult = {
        count: result.length,
        rows: result
      };
    } else {
      dataResult = {
        count: result.rowCount ?? result.rows?.length ?? 0,
        rows: result.rows ?? result[0],
      };
    }
    return {
      status: 'success',
      data: dataResult,
      code: 200,
    }

  } catch (error: any) {
    app.log.error(error)
    return {
      status: 'error',
      code: 400,
      error: error.message || 'An error occurred while reading records',
    }
  }
}

export const updateRecord = async (
  app: FastifyInstance,
  table: string,
  id: string,
  data: any
): Promise<GenericResponse<any | null>> => {
  try {
    const result = await app.db(table).where({ id }).update(data).returning('*')

    if (result.length === 0) {
      return {
        status: 'error',
        code: 400,
        error: 'Record not found',
      }
    }

    return {
      status: 'success',
      data: result,
      code: 200,
    }
  } catch (error: any) {
    app.log.error(error)
    return {
      status: 'error',
      code: 400,
      error: error.message || 'An error occurred while updating the record',
    }
  }
}


export const deleteRecord = async (
  app: FastifyInstance,
  table: string,
  id: string
): Promise<GenericResponse<any | null>> => {
  try {
    const result = await app.db(table).where({ id }).del().returning('*')

    if (result.length === 0) {
      return {
        status: 'error',
        code: 400,
        error: 'Record not found',
      }
    }

    return {
      status: 'success',
      data: null,
      code: 200,
    }
  } catch (error: any) {
    app.log.error(error)
    return {
      status: 'error',
      code: 400,
      error: error.message || 'An error occurred while updating the record',
    }
  }
}
