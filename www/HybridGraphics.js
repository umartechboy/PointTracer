//////////////////////////////////////////////////////////////
//////////////////    Graphics     ///////////////////////////
//////////////////////////////////////////////////////////////

class HybridGraphics {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.ctx.save();
        this.Transformations = 1;
    }

    Clear(color) {
        this.ctx.clearRect(0, 0, Canvas.width, Canvas.height);
    }
    DrawImage(img, x, y) {
        this.ctx.drawImage(img, x, y);
    }
    DrawString(str, x, y) {
        if (str.Text == null || str.Text == '')
            return;

        this.ctx.textAlign = "left";
        this.ctx.strokeStyle = '#00000000';
        this.ctx.font = str.Font.Height + "px " + str.Font.FontFamily;
        this.ctx.fillStyle = str.Color;
        this.ctx.textBaseline = "top";
        this.ctx.fillText(str.Text, x, y);
    }
    MeasureString(str) {
        this.ctx.font = str.Font.Height + "px " + str.Font.FontFamily;
        var sz = this.ctx.measureText(str.Text);
        return new Size(sz.width, str.Font.Height);
    }

    TranslateTransform(x, y) {
        this.ctx.save();
        this.Transformations++;
        this.ctx.translate(x, y);
    }
    ScaleTransform(x, y) {
        this.ctx.save();
        this.Transformations++;
        this.ctx.scale(x, y);
    }
    RotateTransform(r) {
        this.ctx.save();
        this.Transformations++;
        this.ctx.rotate(r);
    }
    UndoTransform() {
        if (this.Transformations > 1);
        {
            this.ctx.restore();
            this.Transformations--;
        }
    }
    DrawRectangle(pen, x, y, width, height) {
        this.ctx.lineWidth = pen.Thickness;
        this.ctx.strokeStyle = pen.Color;
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.stroke();
    }
    DrawEllipse(pen, x, y, width, height) {

        this.ctx.lineWidth = pen.Thickness;
        this.ctx.strokeStyle = pen.Color;
        this.ctx.beginPath();
        this.ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    FillCircle(color, xc, yc, radius) {
        this.ctx.beginPath();
        this.ctx.arc(xc, yc, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    FillRectangle(color, x, y, width, height) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.fill();
    }
    FillPath(color, xs, ys) {
        if (xs.length < 3)
            return;
        if (xs.length != ys.length)
            return;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();

        this.ctx.moveTo(xs[0], ys[0]);  //Startpoint (x, y)
        for (var i = 1; i < xs.length; i++) {
            this.ctx.lineTo(xs[i], ys[i]); //Point 1    (x, y)
        }
        this.ctx.closePath();     //Close the path.
        this.ctx.fill();
    }
    SetClippingRegion(x, y, width, height) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
    }
    ResetClippingRegion() {
        this.ctx.restore();
        // Not completetly supported yet.
    }
    FillRoundedRectangle(color, x, y, w, h, r) {
        if (r < 0)
            r = w + h;
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    FillRoundedRectangleWithGradient(color1, color2, x, y, w, h, r) {

        this.TranslateTransform(x, y);
        // center rect
        this.FillRoundedRectangle(
            color1,
            r,
            r,
            w - r * 2,
            h - r * 2,
            0
        )

        // Upper Rect
        var grd = this.ctx.createLinearGradient(0, 0, 0, r);
        grd.addColorStop(0, color2);
        grd.addColorStop(1, color1);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(r, 0, w - 2 * r, r);


        // Lower Rect
        var grd = this.ctx.createLinearGradient(0, h - r, 0, h);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(r, h - r, w - 2 * r, r);

        // left Rect
        var grd = this.ctx.createLinearGradient(0, 0, r, 0);
        grd.addColorStop(0, color2);
        grd.addColorStop(1, color1);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, r, r, h - 2 * r);

        // right Rect
        var grd = this.ctx.createLinearGradient(w - r, 0, w, 0);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(w - r, r, r, h - 2 * r);

        // upper left corner
        var grd = this.ctx.createRadialGradient(r, r, 0, r, r, r);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, r, r);

        // upper right corner
        var grd = this.ctx.createRadialGradient(w - r, r, 0, w - r, r, r);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(w - r, 0, r, r);

        // bottom left corner
        var grd = this.ctx.createRadialGradient(r, h - r, 0, r, h - r, r);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, h - r, r, r);

        // bottom right corner
        var grd = this.ctx.createRadialGradient(w - r, h - r, 0, w - r, h - r, r);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(w - r, h - r, r, r);
        this.UndoTransform();
    }
    FillRoundedShadowRectangle(color1, color2, x, y, w, h, r, spread) {

        this.TranslateTransform(x, y);
        // center rect
        this.FillRectangle(
            color1,
            r,
            0,
            w - 2 * r,
            h
        );
        // center rect:left
        this.FillRectangle(
            color1,
            0,
            r,
            r,
            h - 2 * r
        );
        // center rect:left
        this.FillRectangle(
            color1,
            w - r,
            r,
            r,
            h - 2 * r
        );

        // Upper Rect
        var grd = this.ctx.createLinearGradient(0, -spread, 0, 0);
        grd.addColorStop(0, color2);
        grd.addColorStop(1, color1);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(r, -spread, w - 2 * r, spread);


        // Lower Rect
        var grd = this.ctx.createLinearGradient(0, h, 0, h + spread);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(r, h, w - 2 * r, spread);

        // left Rect
        var grd = this.ctx.createLinearGradient(-spread, 0, 0, 0);
        grd.addColorStop(0, color2);
        grd.addColorStop(1, color1);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(-spread, r, spread, h - 2 * r);

        // right Rect
        var grd = this.ctx.createLinearGradient(w, 0, w + spread, 0);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(w, r, r, h - 2 * r);

        // upper left corner
        var grd = this.ctx.createRadialGradient(r, r, r, r, r, r + spread);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(-spread, -spread, r + spread, r + spread);

        // upper right corner
        var grd = this.ctx.createRadialGradient(w - r, r, r, w - r, r, r + spread);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(w - r, -spread, r + spread, r + spread);

        // bottom left corner
        var grd = this.ctx.createRadialGradient(r, h - r, r, r, h - r, r + spread);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(-spread, h - r, r + spread, r + spread);

        // bottom right corner
        var grd = this.ctx.createRadialGradient(w - r, h - r, r, w - r, h - r, r + spread);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(w - r, h - r, r + spread, r + spread);
        this.UndoTransform();
    }
    DrawRoundedRectangle(pen, x, y, w, h, r) {
        if (r < 0)
            r = w + h;
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.lineWidth = pen.Thickness;
        this.ctx.strokeStyle = pen.Color;
        this.ctx.stroke();
    }
    DrawLine(pen, point1, point2) {
        this.DrawLines(pen, new Array(point1, point2));
    }
    DrawLines(pen, points) {
        if (points.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].X, points[0].Y);

            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].X, points[i].Y);
            }
            this.ctx.lineWidth = pen.Thickness;
            this.ctx.strokeStyle = pen.Color;
            this.ctx.stroke();
        }
    }

}
class DXString {
    constructor(str, size, color, fontfamily) {
        if (str == null)
            str = "";
        if (size == null)
            size = 10;
        if (color == null)
            color = "black";
        if (fontfamily == null)
            fontfamily = "Arial";
        this.Text = str;
        this.Color = color;
        this.Font = new DXFont(fontfamily, size);
    }
    Clone() {
        var dxs = new DXString(this.Text, this.Font.Height,  this.Color);
        dxs.Font = this.Font.Clone();
        return dxs;
    }

}
class DXFont
{
    constructor(fontFamily, height) {
        this.FontFamily = fontFamily;
        this.Height = height;
    }
    Clone() {
        return new DXFont(this.FontFamily, this.Height);
    }
}
