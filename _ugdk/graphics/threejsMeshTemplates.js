import * as THREE from "three";
export function getShape(ref) {
    switch (ref) {
        case "threejs://box.geometry":
            return new THREE.BoxGeometry(0.1, 0.1, 0.1);
        case "threejs://capsule.geometry":
            return new THREE.CapsuleGeometry(0.1, 0.1, 4, 8);
        case "threejs://circle.geometry":
            return new THREE.CircleGeometry(0.1, 16);
        case "threejs://cone.geometry":
            return new THREE.ConeGeometry(0.1, 0.2, 16);
        case "threejs://cylinder.geometry":
            return new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
        case "threejs://dodecahedron.geometry":
            return new THREE.DodecahedronGeometry(0.1, 0);
        case "threejs://edges.geometry":
            return new THREE.EdgesGeometry(new THREE.BoxGeometry(0.1, 0.1, 0.1));
        case "threejs://extrude.geometry":
            return new THREE.ExtrudeGeometry(new THREE.Shape(), {
                steps: 1,
                depth: 0.1,
                bevelEnabled: false,
            });
        case "threejs://icosahedron.geometry":
            return new THREE.IcosahedronGeometry(0.1, 0);
        case "threejs://lathe.geometry":
            return new THREE.LatheGeometry([new THREE.Vector2(0.1, 0)], 16);
        case "threejs://octahedron.geometry":
            return new THREE.OctahedronGeometry(0.1, 0);
        case "threejs://plane.geometry":
            return new THREE.PlaneGeometry(0.1, 0.1);
        case "threejs://polyhedron.geometry":
            return new THREE.PolyhedronGeometry(
                [
                -1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
                -1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
            ],
                [
                2,1,0,    0,3,2,
                0,4,7,    7,3,0,
                0,1,5,    5,4,0,
                1,2,6,    6,5,1,
                2,3,7,    7,6,2,
                4,5,6,    6,7,4
            ],
                6, 2);
        case "threejs://ring.geometry":
            return new THREE.RingGeometry(0.1, 0.2, 16);
        case "threejs://shape.geometry":
            return new THREE.ShapeGeometry(new THREE.Shape());
        case "threejs://sphere.geometry":
            return new THREE.SphereGeometry(0.1, 16, 16);
        case "threejs://tetrahedron.geometry":
            return new THREE.TetrahedronGeometry(0.1, 0);
        case "threejs://torus.geometry":
            return new THREE.TorusGeometry(0.1, 0.02, 16, 60);
        case "threejs://torusknot.geometry":
            return new THREE.TorusKnotGeometry(0.1, 0.02, 64, 8, 2, 3);
        case "threejs://tube.geometry":
            console.log("Work on this pending...")
            // return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
            //     new THREE.Vector3(0, 0, 0),
            //     new THREE.Vector3(0.1, 0, 0),
            //     new THREE.Vector3(0.2, 0, 0),
            // ]), 64, 0.01, false);
            return null
        case "threejs://wireframe.geometry":
            return new THREE.WireframeGeometry(new THREE.BoxGeometry(0.1, 0.1, 0.1));
        default:
            console.log(`Unsupported geometry: ${ref}`);
            return null;
    }
}