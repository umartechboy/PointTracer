class RectangularPatch extends DXControl
{
	constructor(name, vs) {
		super(name, vs);
		this.ImageAllignment = ContentAllignment.HorizontalCenter_Overlap;
		this.BeforePaint = new EventHandler();
		this.AfterPaint = new EventHandler();
	}
	BasePaint(g)
	{
		this.BeforePaint.Invoke(this, g);
		var cvs = this.CurrentVisualState;
		var cs = cvs.CloneWithOpacity();
		if (cs.Radius < 0) {
			cs.Radius = cs.Width / 2;
			if (cs.Height < cs.Width)
				cs.Radius = cs.Height / 2;
		}

		g.TranslateTransform(cs.Width / 2, cs.Height / 2);
		g.RotateTransform(cs.Rotation * Math.PI / 180);
		g.TranslateTransform(-cs.Width / 2, -cs.Height / 2);
		//OnPrePaintRectangularPatchChild(g);
		var _shadowOffset = new Point(
		  cs.ShadowDistance * Math.cos((cs.ShadowAngle - cs.Rotation) * Math.PI / 180),
			cs.ShadowDistance * Math.sin((cs.ShadowAngle - cs.Rotation) * Math.PI / 180));
		
		//if (((Color)cs.ShadowColor).A > 0)
		{
			if (cs.ShadowSpread > 0) {
				g.FillRoundedShadowRectangle(
					cs.ShadowColor,
					"rgba(255,255,255,0)",
					_shadowOffset.X	,
					_shadowOffset.Y,
					cs.Width,
					cs.Height,
					cs.Radius,
					cs.ShadowSpread
				);

				//g.DrawRoundedRectangle(
				//	new Pen(cs.BorderColor, cs.BorderThickness),
				//	-cs.ShadowSpread, -cs.ShadowSpread, cs.Width + 2 * cs.ShadowSpread, cs.Height + 2 * cs.ShadowSpread,
				//	cs.Radius + cs.ShadowSpread);
			}
		}
		//if (cs.FaceColor.A > 0)
		//{
			g.FillRoundedRectangle(
			  cs.FaceColor,
			  0, 0, cs.Width, cs.Height,
			  cs.Radius);
		//}
		if (cs.BorderThickness > 0.5)
		{
			g.DrawRoundedRectangle(
			  new Pen(cs.BorderColor, cs.BorderThickness),
			  0, 0, cs.Width, cs.Height,
			  cs.Radius);
		}
		if (cs.Text == null)
			;
		else if (cs.Text.Text != "" && cs.Text.Text != null)
		{
			var bkpColor = cs.Text.Color;
			//cs.Text.Color = VisualState.applyOpacity(cs.Text.Color, cs.Opacity);

			var sz = g.MeasureString(cs.Text);
			var textWidth = sz.Width;
			var textHeight = sz.Height;
			var imageWidth = cs.Image == null ? 0 : (cs.Image.Width + this.ImageToTextPadding);
			var imageHeight = cs.Image == null ? 0 : (cs.Image.Height + this.ImageToTextPadding);
			var X = this.BoundsOnTopParent.Width / 2 - textWidth / 2;
			var Y = this.BoundsOnTopParent.Height / 2 - textHeight / 2;
			if (this.ImageAllignment == ContentAllignment.HorizontalCenter_Overlap)
				X = this.BoundsOnTopParent.Width / 2 - textWidth / 2;
			else if (this.ImageAllignment == ContentAllignment.Fill_ImageOnLeft)
				X = this.BoundsOnTopParent.Width - textWidth - this.ImageToTextPadding;
			else if (this.ImageAllignment == ContentAllignment.Center_ImageOnLeft)
				X = imageWidth + this.BoundsOnTopParent.Width / 2 - (textWidth + imageWidth) / 2;
			else if (this.ImageAllignment == ContentAllignment.Fill_ImageOnLeft)
				X = this.BoundsOnTopParent.Width - this.ImageToTextPadding - textWidth;
			else if (this.ImageAllignment == ContentAllignment.Fill_ImageOnRight)
				X = this.ImageToTextPadding;
			else if (this.ImageAllignment == ContentAllignment.Left_ImageOnLeft)
				X = this.ImageToTextPadding + imageWidth + this.ImageToTextPadding + (this.CurrentVisualState.Radius > 0 ? this.CurrentVisualState.Radius : 0);
			else if (this.ImageAllignment == ContentAllignment.Center_ImageOnBottom)
				Y = this.BoundsOnTopParent.Height / 2 - (textHeight + imageHeight) / 2;
			else if (this.ImageAllignment == ContentAllignment.Center_ImageOnTop)
				Y = this.BoundsOnTopParent.Height / 2 - (textHeight + imageHeight) / 2 + imageHeight;

			g.TranslateTransform(X, Y);
			g.DrawString(cs.Text, 0, 0);
			// g.TranslateTransform(-X, -Y);
			g.UndoTransform();
			cs.Text.Color = bkpColor;
		}

		//OnPostPaintRectangularPatchChild(g, debugS);
		g.UndoTransform();
		g.UndoTransform();
		g.UndoTransform();
		// g.TranslateTransform(cs.Width / 2, cs.Height / 2);
		// g.RotateTransform(-cs.Rotation);
		// g.TranslateTransform(-cs.Width / 2, -cs.Height / 2);
		super.BasePaint(g);
		this.AfterPaint.Invoke(this, g);
	}
}
function CaretKeyDown()
{
	if (Form.CaretFocus != null) {
		if (event.key === 'Enter')
			Form.CaretFocus.NotifyCaretEnd();
	}
}
class HTMLTextBoxWrapper extends RectangularPatch {
	constructor(name, vs) {
		super(name, vs);
		this.OnClick.Add(this.onClick);
		this.Cursor = Cursors.IBeam;
		this.OnTextChanged = new EventHandler();
	}
	NotifyTextChanged() {
		this.OnTextChanged.Invoke(this, new EventArgs());
	}
	NotifyCaretEnd() {
		var input = document.getElementById("textentry");
		log("Text Changed: " + input.value);
		this.VisualStates.SetTextText(input.value);
		this.NotifyTextChanged();
		this.NumbersOnly = false;
		var val =
			"position: absolute;" +
			"left: 0;" +
			"top: 0;"+
			"width: 0;"+
			"height: 0;" +
			"opcaity: 0;" +
			"\"";
		input.setAttribute("style", val);
		input.setAttribute("type", this.NumbersOnly ? "number" : "text");
		Form.CaretFocus = null;
	}
	get Text() {
		return this.CurrentVisualState.Text.Text;
	}
	onClick(s, p)
	{
		log("Click");
		var input = document.getElementById("textentry");
		log("Found: " + input);
		var tAllign = "left";
		if (s.ImageAllignment == ContentAllignment.HorizontalCenter_Overlap ||
			s.ImageAllignment == ContentAllignment.Center_ImageOnBottom ||
			s.ImageAllignment == ContentAllignment.Center_ImageOnLeft ||
			s.ImageAllignment == ContentAllignment.Center_ImageOnTop)
			tAllign = "center";
		else if (s.ImageAllignment == ContentAllignment.Fill_ImageOnLeft ||
			s.ImageAllignment == ContentAllignment.Left_ImageOnLeft)
			tAllign = "right";
		var val =
			"position: absolute; left: " + s.BoundsOnTopParent.X +
			"px; top: " + s.BoundsOnTopParent.Y +
			"px; width: " + s.Width +
			"px; height: " + s.Height + "px;" +
			"border-color: white;" +
			"font-size: " + s.CurrentVisualState.Text.Font.Height + "px;" +
			"text-align: " + tAllign + ";" +
			"\"";
		log(val);
		input.setAttribute("style", val);
		input.value = s.CurrentVisualState.Text.Text;
		input.focus();
		Form.CaretFocus = s;
	}
}