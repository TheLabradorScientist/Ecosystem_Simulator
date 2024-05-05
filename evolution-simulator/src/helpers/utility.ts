export const hsv = Phaser.Display.Color.HSVColorWheel();

export interface Tint {

}

export function CreateTint(originalTint: number): number {
    let str = originalTint.toString(16);
    console.log(str)
    let newTintStr = ''
    // originalTint = 0 x f f f f f f
    for (let x = 0; x < str.length-4; x++) {
        const dig = parseInt(str[x], 16);
        let rand = Phaser.Math.Between(12, dig);
        newTintStr += rand.toString();
    }
    for (let x = str.length-4; x < str.length-2; x++) {
        const dig = parseInt(str[x], 16);
        let rand = Phaser.Math.Between(4, 10);
        newTintStr += rand.toString();
    }
    for (let x = str.length-2; x < str.length; x++) {
        const dig = parseInt(str[x], 16);
        let rand = Phaser.Math.Between(0, 2);
        newTintStr += rand.toString();
    }

    let newTint = parseInt(newTintStr);
    console.log(newTint)
    return newTint;
}

/* 
export function modifyColor(scene: Phaser.Scene, key: string) {
    let originalTexture = (scene.textures.get(key).getSourceImage() as HTMLImageElement);

    let newTexture = scene.textures.createCanvas('new', originalTexture.width, originalTexture.height);

    let context = (newTexture.getSourceImage() as HTMLCanvasElement).getContext('2d');

    context.drawImage(originalTexture, 0, 0);

    scene.add.image(100, 100, key);
    scene.add.image(200, 100, 'new');

    scene.time.addEvent({ delay: 500, callback: () => hueShift(context, originalTexture, newTexture), loop: true });
}

export function hueShift (context: CanvasRenderingContext2D, originalTexture: HTMLImageElement, newTexture: Phaser.Textures.CanvasTexture) {
    const pixels = context.getImageData(0, 0, originalTexture.width, originalTexture.height);

    for (let i = 0; i < pixels.data.length / 4; i++) {
        processPixel(pixels.data, i * 4, 0.1);
    }

    context.putImageData(pixels, 0, 0);

    newTexture.refresh();
}    

export function processPixel (data: Uint8ClampedArray, index: number, deltahue: number) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];

    const hsv = Phaser.Display.Color.RGBToHSV(r, g, b);

    const h = hsv.h + deltahue;

    const rgb = Phaser.Display.Color.HSVToRGB(h, hsv.s, hsv.v) as Phaser.Types.Display.ColorObject;

    data[index] = rgb.r;
    data[index + 1] = rgb.g;
    data[index + 2] = rgb.b;

} */