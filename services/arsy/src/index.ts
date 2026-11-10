import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { z } from 'zod';

const app = Fastify({
  logger: { transport: { target: 'pino-pretty' } }
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const ControllerServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  endpoint: z.string().url(),
  status: z.enum(['healthy', 'unhealthy', 'unknown']),
  registeredAt: z.string().datetime()
});

const RegisterControllerSchema = z.object({
  name: z.string().min(1),
  endpoint: z.string().url()
});

type ControllerService = z.infer<typeof ControllerServiceSchema>;
type RegisterController = z.infer<typeof RegisterControllerSchema>;

const controllers = new Map<string, ControllerService>();

app.get('/health', async () => ({ status: 'ok', service: 'arsy' }));

app.post('/api/v1/controllers', {
  schema: {
    body: RegisterControllerSchema,
    response: { 201: ControllerServiceSchema }
  }
}, async (request, reply) => {
  const { name, endpoint } = request.body as RegisterController;
  const id = crypto.randomUUID();
  const controller: ControllerService = {
    id,
    name,
    endpoint,
    status: 'unknown',
    registeredAt: new Date().toISOString()
  };
  controllers.set(id, controller);
  return reply.code(201).send(controller);
});

app.get('/api/v1/controllers', {
  schema: { response: { 200: z.array(ControllerServiceSchema) } }
}, async () => Array.from(controllers.values()));

app.get('/api/v1/controllers/:id', {
  schema: { params: z.object({ id: z.string().uuid() }), response: { 200: ControllerServiceSchema, 404: z.object({ message: z.string() }) } }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const controller = controllers.get(id);
  if (!controller) return reply.code(404).send({ message: 'Controller not found' });
  return controller;
});

app.post('/api/v1/controllers/:id/heartbeat', {
  schema: {
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ status: z.enum(['healthy', 'unhealthy']) }),
    response: { 200: ControllerServiceSchema, 404: z.object({ message: z.string() }) }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as { status: 'healthy' | 'unhealthy' };
  const controller = controllers.get(id);
  if (!controller) return reply.code(404).send({ message: 'Controller not found' });
  controller.status = status;
  return controller;
});

app.delete('/api/v1/controllers/:id', {
  schema: { params: z.object({ id: z.string().uuid() }), response: { 204: z.null(), 404: z.object({ message: z.string() }) } }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  if (!controllers.delete(id)) return reply.code(404).send({ message: 'Controller not found' });
  return reply.code(204).send();
});

const PORT = Number(process.env.ARSY_PORT || process.env.PORT) || 4000;
const HOST = process.env.HOST || '127.0.0.1';

try {
  await app.listen({ port: PORT, host: HOST });
  console.log('ARSY orchestrator running on http://' + HOST + ':' + PORT);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
