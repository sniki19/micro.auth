import runHttpServer from './http-server'


async function bootstrap() {
  await runHttpServer()
}

bootstrap().catch((error) => {
  console.error('Failed to start servers:', error)
  process.exit(1)
})
