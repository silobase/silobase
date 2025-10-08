/**
 * Silobase - Dual Licensed under AGPLv3 and Commercial License
 * Copyright (C) 2025 Silobase Authors
 *
 * This file is part of Silobase.
 * 
 * You may use this file under the terms of the GNU Affero General Public License v3.0
 * as published by the Free Software Foundation, or under a commercial license.
 */

import createApp from './src/app'

const start = async () => {
  const app = await createApp()
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
    console.log('🚀 Server running on port 3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
