import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import type { AppConfig } from './config.js';
import { ApiError } from './errors.js';
import { clientAuth } from './client/auth.js';
import { verifyClientHandoff } from './security/handoff.js';
import { decryptShortSecret, encryptShortSecret } from './security/secrets.js';
import { generateBearerToken, generateVerificationCode, hashToken } from './security/tokens.js';
import type { VeltrixStore, WebLoginRequest } from './store/types.js';

const sessionInput=z.object({ticket:z.string().min(20).max(4096)});
const usernameInput=z.object({minecraftUsername:z.string().regex(/^[A-Za-z0-9_]{3,16}$/)});
const limiter=rateLimit({windowMs:60_000,limit:20,standardHeaders:'draft-7',legacyHeaders:false});

export function createRoutes(store:VeltrixStore,config:AppConfig):Router{
 const router=Router(); const requireClient=clientAuth(store,config);
 router.post('/client/session',limiter,async(req,res,next)=>{try{const input=sessionInput.safeParse(req.body);if(!input.success)throw new ApiError(400,'INVALID_REQUEST','Invalid session request');const identity=verifyClientHandoff(input.data.ticket,config.clientHandoffSecret);if(!identity)throw new ApiError(401,'HANDOFF_INVALID','Identity handoff is invalid or expired');const user=await store.upsertUser(identity);const token=generateBearerToken(),now=new Date();await store.createClientSession({id:randomUUID(),userId:user.id,minecraftUuid:user.minecraftUuid,tokenHash:hashToken(token,config.tokenPepper),createdAt:now,expiresAt:new Date(now.getTime()+43_200_000),lastSeen:now,revokedAt:null});res.status(201).json({token,expiresIn:43200,user:{minecraftUsername:user.minecraftUsername,minecraftUuid:user.minecraftUuid,veltrixUserId:user.veltrixUserId}});}catch(e){next(e);}});
 router.post('/client/heartbeat',requireClient,async(req,res,next)=>{try{await store.touchClientSession(req.veltrixClientSession!.id,new Date());res.status(204).end();}catch(e){next(e);}});
 router.post('/client/session/revoke',requireClient,async(req,res,next)=>{try{await store.revokeClientSession(req.veltrixClientSession!.id,new Date());res.status(204).end();}catch(e){next(e);}});

 router.post('/web-login/request',limiter,async(req,res,next)=>{try{const input=usernameInput.safeParse(req.body);if(!input.success)throw new ApiError(400,'INVALID_USERNAME','Enter a valid Minecraft username');const now=new Date();const active=await store.findActiveClientSessionByUsername(input.data.minecraftUsername,new Date(now.getTime()-120_000),now);if(!active)throw new ApiError(404,'CLIENT_NOT_CONNECTED','Veltrix Client not detected');await store.expirePendingWebLoginRequests(active.userId,now);const code=generateVerificationCode();const request:WebLoginRequest={id:randomUUID(),verificationCodeHash:hashToken(code,config.tokenPepper),codeCiphertext:encryptShortSecret(code,config.sessionSecret),minecraftUuid:active.minecraftUuid,userId:active.userId,status:'pending',createdAt:now,expiresAt:new Date(now.getTime()+300_000),approvedAt:null,deniedAt:null,consumedAt:null};await store.createWebLoginRequest(request);res.status(201).json({requestId:request.id,code,expiresIn:300});}catch(e){next(e);}});
 router.get('/client/web-login/requests',requireClient,async(req,res,next)=>{try{const now=new Date();const requests=await store.listPendingWebLoginRequests(req.veltrixClientSession!.userId,now);res.json({requests:requests.map(r=>({id:r.id,code:decryptShortSecret(r.codeCiphertext,config.sessionSecret),status:r.status,expiresAt:r.expiresAt.toISOString()}))});}catch(e){next(e);}});
 const decide=(status:'approved'|'denied')=>async(req:any,res:any,next:any)=>{try{const ok=await store.setWebLoginStatus(String(req.params.id),req.veltrixClientSession!.userId,status,new Date());if(!ok)throw new ApiError(404,'LOGIN_REQUEST_INVALID','Login request is missing, expired or already handled');res.status(204).end();}catch(e){next(e);}};
 router.post('/client/web-login/:id/approve',requireClient,decide('approved'));
 router.post('/client/web-login/:id/deny',requireClient,decide('denied'));
 router.get('/web-login/:id/status',limiter,async(req,res,next)=>{try{const r=await store.getWebLoginRequest(String(req.params.id));if(!r)throw new ApiError(404,'LOGIN_REQUEST_NOT_FOUND','Login request not found');const status=r.expiresAt<=new Date()&&r.status==='pending'?'expired':r.status;res.json({status});}catch(e){next(e);}});
 router.post('/web-login/:id/complete',limiter,async(req,res,next)=>{try{const now=new Date();const r=await store.getWebLoginRequest(String(req.params.id));if(!r)throw new ApiError(404,'LOGIN_REQUEST_NOT_FOUND','Login request not found');if(r.consumedAt)throw new ApiError(409,'LOGIN_ALREADY_USED','Login request was already consumed');if(r.status!=='approved'||r.expiresAt<=now)throw new ApiError(409,'LOGIN_NOT_APPROVED','Login request is not approved');const claimed=await store.consumeApprovedWebLoginRequest(r.id,now);if(!claimed)throw new ApiError(409,'LOGIN_ALREADY_USED','Login request was already consumed');const token=generateBearerToken(),csrfToken=generateBearerToken(24);await store.createWebSession({id:randomUUID(),userId:r.userId,tokenHash:hashToken(token,config.tokenPepper),csrfHash:hashToken(csrfToken,config.tokenPepper),createdAt:now,expiresAt:new Date(now.getTime()+7*24*60*60*1000),lastSeen:now,revokedAt:null});res.cookie('veltrix_web_session',token,{httpOnly:true,secure:config.cookieSecure,sameSite:config.cookieSecure?'none':'lax',path:'/',maxAge:7*24*60*60*1000});res.json({connected:true,csrfToken});}catch(e){next(e);}});
 return router;
}
