/////////////////////////////////////////////////////////////
////////////////////   Program     ///////////////////////////
//////////////////////////////////////////////////////////////

// this is dummy content. Will be replaced by the actual data by cloudview.

Canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;
g = new HybridGraphics(Canvas);

var UserImage = null;
var dbPanel1 = new RectangularPatch("dbPanel1", new VisualState(0, 30, canvas.width, canvas.height - 30));
dbPanel1.OnClick.Add((s, e) => {
});
var tools = new RectangularPatch("tools", new VisualState(0, 0, canvas.width, 30));

dbPanel1.ZOrder--;
var openFileB = new RectangularPatch("open file", new VisualState(5, 5, 150, 26));
var saveFileB = new RectangularPatch("save file", new VisualState(1000, 5, 250, 26));
var panRB = new RectangularPatch("panRB", new VisualState(200, 5, 150, 26));
var zoomRB = new RectangularPatch("zoomRB", new VisualState(400, 5, 150, 26));
var moveRB = new RectangularPatch("moveRB", new VisualState(600, 5, 150, 26));
var addPointRB = new RectangularPatch("addPointRB", new VisualState(800, 5, 150, 26));
openFileB.VisualStates.SetText(new DXString("Open File", 20));
saveFileB.VisualStates.SetText(new DXString("Save points as CSV", 20));
panRB.VisualStates.SetText(new DXString("Pan", 20));
zoomRB.VisualStates.SetText(new DXString("Zoom", 20));
moveRB.VisualStates.SetText(new DXString("Move", 20));
addPointRB.VisualStates.SetText(new DXString("Add Point", 20));
panRB.OnClick.Add((s, e) => { currentOp = s; });
zoomRB.OnClick.Add((s, e) => { currentOp = s; });
moveRB.OnClick.Add((s, e) => { currentOp = s; });
addPointRB.OnClick.Add((s, e) => { currentOp = s; });
openFileB.VisualStates.SetRadius(-1);
saveFileB.VisualStates.SetRadius(-1);
zoomRB.VisualStates.SetRadius(-1);
panRB.VisualStates.SetRadius(-1);
moveRB.VisualStates.SetRadius(-1);
addPointRB.VisualStates.SetRadius(-1);
var OffsetXG = 0;
var OffsetYG = 0;
var PPU = 1;
var MarkedPoints = new List();
openFileB.OnClick.Add((s, e) => {
    Form.OpenFile((s) => {
        log("call back!: " + s);
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image;
            img.src = URL.createObjectURL(s[0]);
            UserImage = img;
        };
        reader.readAsDataURL(s[0]);
    },
        "image/*");
});
saveFileB.OnClick.Add((s, e) => {
    var sb = "";
    sb += "x,y\r\n";
    for (var i = 0; i < MarkedPoints.Count; i++) {
        var p = MarkedPoints.InnerList[i];
        sb += p.X + "," + p.Y + "\r\n";
    }
    Form.SaveTextFile("Data_" + MarkedPoints.Count + ".csv", sb);
});

openFileB.VisualStates.SetupMouseHover(VisualPresets.Levitate);
openFileB.VisualStates.SetupMouseClick(VisualPresets.Levitate);
saveFileB.VisualStates.SetupMouseHover(VisualPresets.Levitate);
saveFileB.VisualStates.SetupMouseClick(VisualPresets.Levitate);
var currentOp = panRB;
panRB.SetupBehaviour(DXControlBehaviour.RadioButton);
zoomRB.SetupBehaviour(DXControlBehaviour.RadioButton);
moveRB.SetupBehaviour(DXControlBehaviour.RadioButton);
addPointRB.SetupBehaviour(DXControlBehaviour.RadioButton);



tools.AddDXControl(openFileB);
tools.AddDXControl(saveFileB);
tools.AddDXControl(panRB);
tools.AddDXControl(zoomRB);
tools.AddDXControl(moveRB);
tools.AddDXControl(addPointRB);
panRB.NotifyClick(panRB, new EventArgs());

window.addEventListener('keydown', this.check, false);

function check(e) {
    var keyData = e.keyCode;
    if (keyData == 65 || keyData == 83 /*S*/ || keyData == 68 || keyData == 87 /*W*/ && MarkedPoints.Count > 0) {
        var p = new PointF(VtoG(MarkedPoints.Last().X, OffsetXG, PPU), VtoG(MarkedPoints.Last().Y, OffsetYG, PPU));
        if (keyData == 65)
            p = new PointF(p.X - 1, p.Y);
        else if (keyData == 68)
            p = new PointF(p.X + 1, p.Y);
        else if (keyData == 83)
            p = new PointF(p.X, p.Y + 1);
        else if (keyData == 87)
            p = new PointF(p.X, p.Y - 1);
        MarkedPoints.RemoveAt(MarkedPoints.Count - 1);
        MarkedPoints.Add(new PointF(GtoV(p.X, OffsetXG, PPU), GtoV(p.Y, OffsetYG, PPU)));
    }
    else if (keyData == 8 && MarkedPoints.Count > 0) {
        MarkedPoints.RemoveAt(MarkedPoints.Count - 1);
    }
    else if (keyData == 80)
        panRB.NotifyClick(panRB, new EventArgs());
    else if (keyData == 77)
        moveRB.NotifyClick(moveRB, new EventArgs());
    else if (keyData == 107)
        addPointRB.NotifyClick(addPointRB, new EventArgs());
    else if (keyData == 90) {
        zoomRB.NotifyClick(zoomRB, new EventArgs());
    }
    //else if (keyData == Keys.Add)
    //    addPointRB.Checked = true;
    //else if (keyData == Keys.Insert) {
    //    StringBuilder sb = new StringBuilder();
    //    sb.AppendLine("x,y");
    //    foreach(var p in MarkedPoints)
    //    {
    //        sb.AppendLine(p.X + "," + p.Y);
    //    }
    //    File.WriteAllText(DateTime.Now.ToString("hh_mm") + ".csv", sb.ToString());
    //}
}

dbPanel1.BeforePaint.Add((dbPanel1, g) => {
    var sz = 6;
    if (UserImage != null) {
        g.TranslateTransform(OffsetXG, OffsetYG);
        g.ScaleTransform(PPU, PPU);
        g.DrawImage(UserImage, 0,0);
        g.UndoTransform();
        g.UndoTransform();
    }
    for (var i = 0; i < MarkedPoints.Count; i++) {
        var po = MarkedPoints.InnerList[i];
        var p = new PointF(VtoG(po.X, OffsetXG, PPU), VtoG(po.Y, OffsetYG, PPU));
        g.DrawEllipse(new Pen("black", 3), p.X - sz / 2, p.Y - sz / 2, sz, sz);
        g.DrawEllipse(new Pen("yellow", 1), p.X - sz / 2, p.Y - sz / 2, sz, sz);
        //dbPanel1.g.DrawString(p.ToString(), dbPanel1.Font, Brushes.Yellow, p.X + sz, p.Y + sz);

    }
}
);
var lastMouseWhileDown = null;
var mouseDownAt = new Point();
var GXAtMouseDown = 0;
var VXAtMouseDown = 0;
function VtoG(v, offsetG, ppu)
{
    return v * ppu + offsetG;
}
function GtoV(vG, offsetG, ppu)
{
    return (vG - offsetG) / ppu;
}
dbPanel1.OnMouseDown.Add((s, e) => {
    log("mouse down: " + currentOp);
    if (currentOp == addPointRB) {
        MarkedPoints.Add(new PointF(
            GtoV(e.X, OffsetXG, PPU),
            GtoV(e.Y - dbPanel1.Top , OffsetYG, PPU)// why ??
        ));
    }
    else {
        lastMouseWhileDown = new Point(e.X, e.Y - dbPanel1.Top);// why are we removingTop?);
        mouseDownAt = new Point(e.X, e.Y);
        GXAtMouseDown = e.X;
        VXAtMouseDown = GtoV(e.X, OffsetXG, PPU)
        GYAtMouseDown = e.Y;
        VYAtMouseDown = GtoV(e.Y, OffsetYG, PPU)
    }
});
dbPanel1.OnMouseMove.Add((s, e) => {

    if (this.lastMouseWhileDown == null)
        return;
    var dx = e.X - lastMouseWhileDown.X;
    var dy = e.Y - lastMouseWhileDown.Y;
    lastMouseWhileDown = new Point(e.X, e.Y);
    if (currentOp == moveRB) {
        var newList = new List();
        for (var i = 0; i < MarkedPoints.Count; i++)
            newList.Add(new PointF(MarkedPoints.InnerList[i].X + dx / PPU, MarkedPoints.InnerList[i].Y + dy / PPU))
        MarkedPoints = newList;
    }
    else if (currentOp == zoomRB) {
        var changeGX = dx - dy;
        var totalShownVX = dbPanel1.Width / PPU;
        var changeVX = -(changeGX) / PPU;
        var newTotalVX = totalShownVX + changeVX;
        if (newTotalVX < 0) {
            log("E 0");
            return;
        }
        var changeGY = dy;
        var totalShownVY = dbPanel1.Width / PPU;
        var changeVY = -(changeGY) / PPU;
        var newTotalVY = totalShownVY + changeVY;
        if (newTotalVY < 0) {
            log("E 0");
            return;
        }
        PPU = dbPanel1.Width / newTotalVX;
        OffsetXG = GXAtMouseDown - VXAtMouseDown * PPU;
        OffsetYG = GYAtMouseDown - VYAtMouseDown * PPU;

    }
    else if (currentOp == panRB) {
        OffsetXG += dx;
        OffsetYG += dy;
    }
});
dbPanel1.OnMouseUp.Add((s, e) => { lastMouseWhileDown = null; });
Form.AddDXControl(dbPanel1);
Form.AddDXControl(tools);

function loop() {
}
ApplicationRun();