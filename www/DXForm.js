//////////////////////////////////////////////////////////////
////////////            DXForm      //////////////////////////
//////////////////////////////////////////////////////////////
var PaintTick = null;
class DXForm
{
	constructor()
	{
		this.DXControls = new List();
		this.MouseWentDownAt = new Point();
		this.currentControlUnderMouse = null;
		this.CaretFocus = null;
	}
	
	OnPaint(hyg)
	{
		if (PaintTick != null)
			PaintTick();
		hyg.Clear('white');
		for (let i = 0; i < this.DXControls.Count; i++)
		{
			var control = this.DXControls.InnerList[i];
			if (control == null)
				continue;
			var x = control.Left;
			var y = control.Top;

			hyg.TranslateTransform(x, y);
			control.BasePaint(hyg);
			hyg.UndoTransform();
		}
		if (this.CaretFocus != null)
		hyg.FillRectangle('rgba(0,0,0,0.6)',0,0,3000,2000);
	}
	
	AddDXControl(control)
	{
		this.DXControls.Add(control);
		control.AddedToParent(null);
		return control;
	}
}
function requestInstantDisplay() {
	var g = new HybridGraphics(Canvas);
	Form.OnPaint(g);
	SharedResources.AnimationLoop();
}
function ApplicationRun()
{
	requestInstantDisplay();
	loop();
	requestAnimationFrame(ApplicationRun);
} 
var Form = new DXForm();
addEventListener("mousemove", (e) => {

	var rect = canvas.getBoundingClientRect();
	x = e.clientX - rect.left;
	y = e.clientY - rect.top;
	var e2 = new MouseEventArgs(x, y);
	if (Form.CaretFocus != null) {
		return;
	}

	for (let i = Form.DXControls.Count - 1; i >= 0; i--)
		if (Form.DXControls.InnerList[i].ProcessMouseMove(e2, Form.currentControlUnderMouse))
			break;
});
addEventListener("mousedown", (e) => {
	var rect = canvas.getBoundingClientRect();
	x = e.clientX - rect.left;
	y = e.clientY - rect.top;
	var e2 = new MouseEventArgs(x, y);
	Form.MouseWentDownAt = new Point(x, y);

	if (Form.CaretFocus != null) {
		// send the changed text to the control;
		if (Form.CaretFocus.TopParentBoundsContains(e2))
			return;
		Form.CaretFocus.NotifyCaretEnd();
		Form.CaretFocus = null;
		return;
	}
	//log('Down at:' + x + ', '+ y);
	for (let i = Form.DXControls.Count - 1; i >= 0; i--) {
		Form.currentControlUnderMouse = Form.DXControls.InnerList[i].ProcessMouseDown(e2);
		if (Form.currentControlUnderMouse != null)
			return;
	}
});
addEventListener("mouseup", (e) => {
  
  var rect = canvas.getBoundingClientRect();
  x =  e.clientX - rect.left;
  y = e.clientY - rect.top;
  var e2 = new MouseEventArgs(x,y);

	if (Form.CaretFocus != null) {
		return;
	}
  //log('Up at:' + x + ', '+ y);
  for (let i = Form.DXControls.Count - 1; i >= 0; i--)
	Form.DXControls.InnerList[i].ProcessMouseUp(e2, Form.currentControlUnderMouse);
  Form.currentControlUnderMouse = null;
});
addEventListener("click", (e) => {
	var rect = canvas.getBoundingClientRect();
	x =  e.clientX - rect.left;
	y = e.clientY - rect.top;
    var e2 = new MouseEventArgs(x,y);
	
	return;
    //log('Click at:' + x + ', '+ y);
	if (Form.MouseWentDownAt.X != x || Form.MouseWentDownAt.Y != y)
	  return;
	for (let i = Form.DXControls.Count - 1; i >= 0; i--)
		Form.DXControls.InnerList[i].ProcessMouseClick(e1, Form.currentControlUnderMouse);
});
