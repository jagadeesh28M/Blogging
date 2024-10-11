import { Hono } from "hono";
import { verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge' 
import { withAccelerate } from '@prisma/extension-accelerate'
import { createBlogInput } from "@jagadeesh28/medium-common";

export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
        JWT_SECRET:string
	},
    Variables:{
        userId : string;
    }
}>();

blogRouter.use('/*', async (c,next)=>{
    const token = c.req.header("Authorization") || "";
    try{
         const user = await verify(token , c.env.JWT_SECRET);
        if(user){
            //@ts-ignore
            c.set("userId",user.id);
            await next();
        }else{
            c.status(403);
            return c.json({
                msg : "You are not logged in"
            })
        }
    }catch(e){
        c.status(403);
        return c.json({
            message:"You are not logged in"
        })
    }
})

blogRouter.post('/new', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const body = await c.req.json();
        const {success} = createBlogInput.safeParse(body);
        if(!success){
            c.status(411);
            return c.json({
                message : "Invalid Inputs"
            })
        }  
        const authorId = c.get("userId");

        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId) 
            }
        });

        return c.json({ id: blog.id });
    } catch (e) {
        console.error('Error in POST /:', e); // Log the error
        c.status(500); // Internal Server Error
        return c.json({ message: "Failed to create blog." });
    }
})

blogRouter.put('/update', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = createBlogInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            message : "Invalid Inputs"
        })
    } 

    const blog = await prisma.blog.update({
        where:{
            id : body.id
        },
        data:{
            title:body.title,
            content : body.content
        }
    })

    return c.json({
        id: blog.id,
        title:blog.title,
        content:blog.content
    })
})

blogRouter.get('/bulk',async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try{
        const blogs = await prisma.blog.findMany();
        return c.json({blogs});
    } catch(e){
        c.status(411);
        return c.json({
            Message : "Error while fetching blogs"
        })
    }
})


blogRouter.get('/:id', async (c) => {
	const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const id = await c.req.param("id");

    try{
        const blog = await prisma.blog.findFirst({
            where:{
                id : Number(id)
            }
        })
    
        return c.json({
            id: blog
        })
    } catch(e){
        c.status(411);
        return c.json({
            Message : "Error while fetching data"
        })
    }
})


