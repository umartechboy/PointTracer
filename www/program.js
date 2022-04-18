/////////////////////////////////////////////////////////////
////////////////////   Program     ///////////////////////////
//////////////////////////////////////////////////////////////

// this is dummy content. Will be replaced by the actual data by cloudview.

Canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;
g = new HybridGraphics(Canvas);

var UserImage = null;
var panel = new RectangularPatch("panel", new VisualState(0, 0, canvas.width, canvas.height));
panel.VisualStates.SetTextText("This is a panel");
panel.OnClick.Add((s, e) => {
});

panel.ZOrder--;
var rb1 = new RectangularPatch("rb1", new VisualState(0, 0, 200, 50));
var rb2 = new RectangularPatch("rb2", new VisualState(210, 0, 200, 50));
var rb3 = new RectangularPatch("rb3", new VisualState(420, 0, 200, 50));
rb1.VisualStates.SetTextText("Radio Button 1");
rb2.VisualStates.SetTextText("Radio Button 2");
rb3.VisualStates.SetTextText("Radio Button 3");

rb1.SetupBehaviour(DXControlBehaviour.RadioButton);
rb2.SetupBehaviour(DXControlBehaviour.RadioButton);
rb3.SetupBehaviour(DXControlBehaviour.RadioButton);

rb1.NotifyClick(rb1, new EventArgs());

Form.AddDXControl(rb1);
Form.AddDXControl(rb2);
Form.AddDXControl(rb3);

panel.BeforePaint.Add((panel, g) => {
    if (UserImage != null) {
        g.DrawImage(UserImage, 0, 0);
    }
}
);
Form.AddDXControl(panel);
function loop() {
}
ApplicationRun();