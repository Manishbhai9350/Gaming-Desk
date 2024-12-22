import "./style.css";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as Three from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const lenis = new Lenis();
gsap.registerPlugin(ScrollTrigger);

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const scene = new Three.Scene();

const renderer = new Three.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = Three.PCFSoftShadowMap;
renderer.toneMapping = Three.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

document.querySelector(".model").appendChild(renderer.domElement);

const camera = new Three.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
scene.add(camera);
camera.position.z = 10;

const loader = new GLTFLoader();

let Desk;
let floatingSpeed = 2.5;
let floatAmp = 0.6;

loader.load("/model/gaming_desk.glb", (gltf) => {
  Desk = gltf.scene;

  const box = new Three.Box3().setFromObject(Desk);
  const center = box.getCenter(new Three.Vector3());
  Desk.position.sub(center);
  Desk.position.set(0, -2, 0);
  Desk.scale.setScalar(4);
  Desk.rotation.set(0.4, Math.PI / 2, 0);
  Desk.traverse((node) => {
    if (node.isMesh) {
      if (node.material) {
        node.material.roughness = 2;
        node.material.metalness = 1;
      }
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });

  gsap.to(Desk.rotation, {
    y: Desk.rotation.y + Math.PI * 2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".info",
      start: "top top",
      end: "bottom center",
      scrub: 2,
    },
  });
  ScrollTrigger.create({
    trigger: ".outro",
    start: "top bottom",
    end: "top top",
    scrub: 2,
    onUpdate:self => {
      const prog = self.progress
      if (innerWidth > 600) {
        gsap.set(Desk.position,{
          x:-5 * prog
        })
      }
    }
  })
  gsap.to(Desk.rotation, {
    z: 0.4,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".outro",
      start: "top bottom",
      end: "top top",
      scrub: 2,
    },
  });

  scene.add(Desk);
});

// ??  Adding Lights

const Amb = new Three.AmbientLight(0xffffff, 0.6);
const Dir = new Three.DirectionalLight(0xffffff, 1);
Dir.position.set(-10, 0, -5);
const Dir2 = new Three.DirectionalLight(0x000000, 2);
Dir.position.set(10, 0, -5);
const Dir3 = new Three.DirectionalLight(0xffffff, 1);
Dir.position.set(0, 10, 0);

scene.add(Amb, Dir, Dir2, Dir3);

function Animate(t) {
  renderer.render(scene, camera);
  requestAnimationFrame(Animate);
  if (Desk) {
    Desk.position.y = -2 + Math.sin(t * 0.0003 * floatingSpeed) * floatAmp;
  }
}
requestAnimationFrame(Animate);

function Resize() {
  let modelScale = innerWidth / 250 
  modelScale = modelScale > 4.5 ? 4.5 : modelScale
  if (Desk) {
    gsap.to(Desk.scale,{
      x:modelScale,
      y:modelScale,
      z:modelScale
    })
  }
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", Resize);

const InfoChilds = gsap.utils.toArray(".info-child");
InfoChilds.forEach(child => {
  ScrollTrigger.create({
    trigger:child,
    start:'top 60%',
    end:"bottom 40%",
    onEnter:() => {
      gsap.to(child,{opacity:1})
    },
    onLeave:() => {
      gsap.to(child,{opacity:.3})
    },
    onEnterBack:() => {
      gsap.to(child,{opacity:1})
    },
    onLeaveBack:() => {
      gsap.to(child,{opacity:.3})
    },
  })
})


const HeroH1s = document.querySelectorAll('.hero .line h1')

HeroH1s.forEach(h1 => {
  h1.style.overflow = 'hidden'
  const HTML = h1.textContent;
  const Spans = HTML.split('').map(t => {
    const span = document.createElement('span') 
    span.style.display = 'inline-block'
    span.style.position = 'relative'
    span.textContent = t 
    gsap.set(span,{
      yPercent:150
    })
    return span
  })
  h1.innerHTML = ''
  h1.append(...Spans)
})

gsap.to('.hero .line h1 span',{
  yPercent:0,
  stagger:0.04,
})