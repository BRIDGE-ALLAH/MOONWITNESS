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

// PPPoE Session schemas
const PppoeSessionSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  nas_ip: z.string(),
  nas_port: z.string(),
  called_station_id: z.string().optional().nullable(),
  calling_station_id: z.string().optional().nullable(),
  framed_ip_address: z.string().optional().nullable(),
  framed_ipv6_prefix: z.string().optional().nullable(),
  session_start: z.string().datetime(),
  status: z.enum(['active', 'terminated', 'pending']),
  acct_session_id: z.string(),
  last_update: z.string().datetime().optional(),
});

const PppoeSessionCreateSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  nas_ip: z.string(),
  nas_port: z.string(),
  called_station_id: z.string().optional().nullable(),
  calling_station_id: z.string().optional().nullable(),
  framed_ip_address: z.string().optional().nullable(),
  framed_ipv6_prefix: z.string().optional().nullable(),
  session_start: z.string().datetime(),
  status: z.enum(['active', 'terminated', 'pending']),
  acct_session_id: z.string(),
});

const PppoeAccountingSchema = z.object({
  framed_ip_address: z.string().optional().nullable(),
  framed_ipv6_prefix: z.string().optional().nullable(),
  last_update: z.string().datetime(),
  status: z.enum(['active', 'terminated', 'pending']),
});

type PppoeSession = z.infer<typeof PppoeSessionSchema>;
type PppoeSessionCreate = z.infer<typeof PppoeSessionCreateSchema>;
type PppoeAccounting = z.infer<typeof PppoeAccountingSchema>;

const pppoeSessions = new Map<string, PppoeSession>();

app.get('/health', async () => ({ status: 'ok', service: 'arsy' }));

// Controller endpoints
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

// PPPoE Session endpoints (for RADIUS service)
app.post('/api/v1/pppoe/sessions', {
  schema: {
    body: PppoeSessionCreateSchema,
    response: { 201: PppoeSessionSchema, 400: z.object({ message: z.string() }) }
  }
}, async (request, reply) => {
  const input = request.body as PppoeSessionCreate;
  const session: PppoeSession = {
    ...input,
    last_update: new Date().toISOString()
  };
  pppoeSessions.set(session.id, session);
  return reply.code(201).send(session);
});

app.get('/api/v1/pppoe/sessions', {
  schema: { response: { 200: z.array(PppoeSessionSchema) } }
}, async () => Array.from(pppoeSessions.values()));

app.get('/api/v1/pppoe/sessions/:id', {
  schema: { params: z.object({ id: z.string().uuid() }), response: { 200: PppoeSessionSchema, 404: z.object({ message: z.string() }) } }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const session = pppoeSessions.get(id);
  if (!session) return reply.code(404).send({ message: 'Session not found' });
  return session;
});

app.post('/api/v1/pppoe/sessions/:id/terminate', {
  schema: { params: z.object({ id: z.string().uuid() }), response: { 200: PppoeSessionSchema, 404: z.object({ message: z.string() }) } }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const session = pppoeSessions.get(id);
  if (!session) return reply.code(404).send({ message: 'Session not found' });
  session.status = 'terminated';
  session.last_update = new Date().toISOString();
  return session;
});

app.post('/api/v1/pppoe/sessions/:id/accounting', {
  schema: {
    params: z.object({ id: z.string().uuid() }),
    body: PppoeAccountingSchema,
    response: { 200: PppoeSessionSchema, 404: z.object({ message: z.string() }) }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const accounting = request.body as PppoeAccounting;
  const session = pppoeSessions.get(id);
  if (!session) return reply.code(404).send({ message: 'Session not found' });
  
  if (accounting.framed_ip_address !== undefined) session.framed_ip_address = accounting.framed_ip_address;
  if (accounting.framed_ipv6_prefix !== undefined) session.framed_ipv6_prefix = accounting.framed_ipv6_prefix;
  session.status = accounting.status;
  session.last_update = accounting.last_update;
  
  return session;
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
