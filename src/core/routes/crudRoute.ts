import * as CrudService from '../services/crudService.ts';
import { FastifyPluginAsync } from 'fastify';


const crudRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/:table', async (request, reply) => {
        if (!['write', 'full'].includes(request.permission!)) {
            return reply.code(403).send({ error: 'Forbidden: Write access required' })
        }
        const { table } = request.params as { table: string };
        const data = request.body;
        const result: any = await CrudService.createRecord(fastify, table, data);
        reply.status(result?.code).send(result);
    });
    fastify.get('/:table', async (request, reply) => {
        if (!['read', 'full'].includes(request.permission!)) {
            return reply.code(403).send({ error: 'Forbidden: Read access required' })
        }
        const { table } = request.params as { table: string };
        const query = request.query as Record<string, string>;
        const result: any = await CrudService.readRecords(fastify, table, query);
        reply.status(result?.code).send(result);
    });

    fastify.put('/:table/:id', async (request, reply) => {
        if (!['write', 'full'].includes(request.permission!)) {
            return reply.code(403).send({ error: 'Forbidden: Write access required' })
        }
        const { table, id } = request.params as { table: string; id: string };
        const data = request.body;
        const result: any = await CrudService.updateRecord(fastify, table, id, data);
        reply.status(result?.code).send(result);
    });

    fastify.delete('/:table/:id', async (request, reply) => {   
        if (!['write', 'full'].includes(request.permission!)) {
            return reply.code(403).send({ error: 'Forbidden: Write access required' })
        }
        const { table, id } = request.params as { table: string; id: string };
        const result: any = await CrudService.deleteRecord(fastify, table, id);
        reply.status(result?.code).send(result);
    });
}

export default crudRoutes;