import createCoreApp from './core/app.ts'
import dotenv from 'dotenv'
dotenv.config()

const start = async () => {
  const app = await createCoreApp();

  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
    console.log('🚀 Server running on port 3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
