const textureCache = {};

function imageError(event) {
    const p = document.createElement("p");
    p.innerText = `Texture not found: ${event.target.src}`;
    document.getElementById("errors").appendChild(p);
}

export function load(name) {
    const fullFileName = `textures/${name}.png`;
    const foundCached = textureCache[fullFileName];
    if (foundCached) {
        return foundCached;
    }
    const img = new Image();
    img.onerror = imageError;
    img.src = fullFileName;
    textureCache[fullFileName] = img;
    return img;
}

export function loadAnimation(name, numFrames) {
    const anim = [];
    for (let i = 0; i < numFrames; ++i) {
        const frameName = name + i.toString().padStart(4, "0");
        anim.push(load(frameName));
    }
    return anim;
}