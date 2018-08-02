# Ghost accelerator for responsive images

We managed to make a Ghost blog about 30% faster by integrating it into a Fly Edge App ... shown in the Lighthouse scores below. This Fly App optimizes images by properly sizing images on-the-fly and converting images to webp.

## Lighthouse Score Before

![Ghost Performance Score Before](images/GhostBefore@2x.png "Ghost Performance Score Before")

![Ghost Performance Score Before](images/GhostBefore2@2x.png "Ghost Performance Score Before")

## Lighthouse Score After

![Ghost Performance Score After](images/GhostAfter@2x.png "Ghost Performance Score After")

![Ghost Performance Score After](images/GhostAfter2@2x.png "Ghost Performance Score After")

## Try it yourself

1. First, make sure you have the latest version of Fly installed by running `npm i -g @fly/fly`
2. `git clone https://github.com/superfly/ghost-accelerator.git`
3. `cd ghost-accelerator`
4. `fly server`
5. Visit http://localhost:3000 to view the app

You should see the "demo" version of a Ghost blog (https://demo.ghost.io/)

6. Navigate to the `index.js` file and change `const subdomain` from `"demo"` to your own Ghost Blog's name
7. Save and visit http://localhost:3000 again

You should now see your own Ghost Blog with properly sized, optimized images in the WebP format! Run a Lighthouse audit and see for yourself just how well your blog is performing .. and then, deploy!

8. Run `fly login` (make sure you have a Fly account first, if you don’t, register at https://fly.io/app/sign-up)
9. Run `fly apps create <app-name>` to create a Fly Edge App
10. Then run `fly deploy` to deploy your Fly Edge App