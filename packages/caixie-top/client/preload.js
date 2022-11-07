// https://dona.ai/scripts/preload.js
const body = document.querySelector('body');

const { timeline, to } = gsap;

const width = 80;
const height = 80;

let renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});

renderer.setSize(width, height);
renderer.setPixelRatio(2);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.querySelector('body .preload').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

camera.position.z = 300;

const rectangle = (ctx, x, y, width, height, radius) => {
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
};

const rectangleReverse = (ctx, x, y, width, height, radius) => {
    ctx.moveTo(x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
};

let rect = new THREE.Shape();
rectangle(rect, -72, -72, 144, 144, 66);
var rectSmall = new THREE.Path();
rectangleReverse(rectSmall, -62, -62, 124, 124, 52);
rect.holes.push(rectSmall);

let shape = new THREE.ExtrudeBufferGeometry(rect, {
    curveSegments: 24,
    depth: 8,
    bevelEnabled: true,
    bevelSegments: 10,
    steps: 10,
    bevelSize: 4,
    bevelThickness: 4,
});

const geometry = new THREE.Geometry();
geometry.fromBufferGeometry(shape);
geometry.mergeVertices();
geometry.center();

let material = new THREE.MeshPhongMaterial({
    color: 0x008ffd,
    shininess: 25,
});
let donut = new THREE.Mesh(geometry, material);

donut.castShadow = true;
donut.receiveShadow = true;

scene.add(donut);

let planeGeometry = new THREE.PlaneGeometry(200, 200),
    planeMaterial = new THREE.ShadowMaterial({ opacity: 0.04 });

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.z = -80;
plane.receiveShadow = true;
scene.add(plane);

const lightFront = new THREE.DirectionalLight(0xffffff, 0.5);
lightFront.position.set(0, 50, 300);
lightFront.castShadow = true;

const d = 200;
lightFront.shadow.camera.left = -d;
lightFront.shadow.camera.right = d;
lightFront.shadow.camera.top = d;
lightFront.shadow.camera.bottom = -d;

lightFront.shadow.mapSize.width = 512;
lightFront.shadow.mapSize.height = 512;

const lightTop = new THREE.DirectionalLight(0xffffff, 0.5);
lightTop.position.set(0, 400, 40);

scene.add(lightFront);
scene.add(lightTop);

scene.add(new THREE.AmbientLight(0x0184fa));

var rotate = to(donut.rotation, {
    repeat: -1,
    keyframes: [
        {
            x: THREE.Math.degToRad(180),
            duration: 1,
            ease: 'power1.inOut',
        },
        {
            y: THREE.Math.degToRad(-180),
            duration: 1,
            ease: 'power1.inOut',
        },
    ],
});

const render = () => {
    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

render();

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        setTimeout(() => {
            window.scrollTo(0, 0);

            rotate.pause();

            to(donut.rotation, {
                x: 0,
                y: 0,
                duration: 0.4,
            });

            const bound = renderer.domElement.getBoundingClientRect();

            to(renderer.domElement, {
                scale: 0.64,
                duration: 0.4,
            });

            to(renderer.domElement, {
                duration: 0.4,
                ease: 'power2.inOut',
                y: -(bound.top - 10),
                x: -33.5,
                onComplete: () => {
                    document.dispatchEvent(new Event('customLoad'));
                    document.customLoad = true;
                    body.classList.add('preload_ready');
                    to(renderer.domElement, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            body.classList.remove('preload_active');
                            body.classList.remove('preload_ready');
                        },
                    });
                },
            });
        }, 1000);
    }
};
