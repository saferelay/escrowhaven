import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasAlchemyKey: !!process.env.ALCHEMY_API_KEY,
    hasPrivateKey: !!process.env.PRIVATE_KEY,
    hasFactoryAddress: !!process.env.POLYGON_FACTORY_ADDRESS,
    alchemyKeyPreview: process.env.ALCHEMY_API_KEY ? 
      process.env.ALCHEMY_API_KEY.substring(0, 8) + '...' : 'NOT FOUND',
    privateKeyPreview: process.env.PRIVATE_KEY ?
      process.env.PRIVATE_KEY.substring(0, 10) + '...' : 'NOT FOUND',
    factoryAddress: process.env.POLYGON_FACTORY_ADDRESS || 'NOT FOUND',
    nodeEnv: process.env.NODE_ENV
  });
}
