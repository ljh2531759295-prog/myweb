import {createRouter, createWebHistory, createWebHashHistory} from "vue-router";

const routes = [
    {
        path:"/",
        redirect: "/musicplayer"
    },
    {
        path:"/home",
        component:()=>import("@/views/index.vue")
    },
    {
        path:"/login",
        component:()=>import("@/views/loginregister.vue")
    },
    {
        path:"/user/:id/name/:name?",
        name:"member",
        component:()=>import("@/views/user.vue")
    },
    {
        path:"/musicplayer",
        component:()=>import("@/views/musicplayer/App.vue")
    },


]
// 创建路由器、
const router =createRouter({
    history: process.env.NODE_ENV === 'production' ? createWebHashHistory() : createWebHistory(),
    routes
})

// 导出路由器
export default router