//////////////////////////////////////////////////////////////
////////////         VisualState      ////////////////////////
//////////////////////////////////////////////////////////////

class MixType {
	static Linear = 0;
	static EaseIn = 1;
	static EaseOut = 2;
	static EaseInEaseOut = 3;
	static Retract = 4;
}
class VisualState {
	constructor(left, top, width, height, opacity) {
		if (opacity == null)
			opacity = 1;
		if (left == null)
			left = 0;
		if (top == null)
			top = 0;
		if (width == null)
			width = 0;
		if (height == null)
			height = 0;

		this.AllowAutoTransition = false;
		this.Left = left;
		this.Top = top;
		this.Width = width;
		this.Height = height;
		this.Rotation = 0;
		this.Radius = 0;
		this.BorderThickness = 0;
		this.BorderColor = '#00000000';
		this.BorderColor = '#FF000000';
		this.FaceColor = 'rgba(255,255,255,0)';
		this.ShadowColor = '#00000000';
		this.ShadowSpread = 0;
		this.ShadowIntensity = 0;
		this.ShadowDistace = 0;
		this.ShadowAngle = 0;
		this.Opacity = opacity;
		this.Text = new DXString();
		this.Image = null;
		this.Link = null;
		this.OnAnimationComplete = new EventHandler();
		this.OnAnimationStep = new EventHandler();
	}
	static applyOpacity(c, opacityFactor) {
		var col = this.colorToRGB(c);
		return "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + (col[3] * opacityFactor) + ")";
		//return Color.FromArgb((int)Math.Round(c.A * Math.Min(Math.Max(opacityFactor, 0), 1)), c);
	}
	CloneWithOpacity() {
		var state = this.Clone();
		state.BorderColor = VisualState.applyOpacity(state.BorderColor, this.Opacity);
		state.FaceColor = VisualState.applyOpacity(state.FaceColor, this.Opacity);		
		state.ShadowColor = VisualState.applyOpacity(state.ShadowColor, this.Opacity);
		state.Text.Color = VisualState.applyOpacity(state.Text.Color, this.Opacity);
		//state.Image = applyOpacity(state.Image, Opacity);
		return state;
	}
	Clone() {
		var vs = new VisualState();
		vs.Left = this.Left;
		vs.Top = this.Top;
		vs.Width = this.Width;
		vs.Height = this.Height;
		vs.Rotation = this.Rotation;
		vs.Radius = this.Radius;
		vs.BorderThickness = this.BorderThickness;
		vs.BorderColor = this.BorderColor;
		vs.FaceColor = this.FaceColor;
		vs.ShadowColor = this.ShadowColor;
		vs.ShadowSpread = this.ShadowSpread;
		vs.ShadowIntensity = this.ShadowIntensity;
		vs.ShadowDistance = this.ShadowDistance;
		vs.ShadowAngle = this.ShadowAngle;
		vs.Opacity = this.Opacity;
		vs.Text = this.Text.Clone();
		vs.Image = this.Image;
		vs.Link = this.Link;
		return vs;
	}
	static simplifyMixType(p, mt, fSetP, fSetMt) {
		if (mt == MixType.Retract) {
			p = 2.0 * (0.5 - Math.abs(0.5 - p));
			mt = MixType.Linear;
		}
		else if (mt == MixType.EaseIn) {
			p *= p * p;
			mt = MixType.Linear;
		}
		else if (mt == MixType.EaseOut) {
			p = Math.pow(p, 0.3);
			mt = MixType.Linear;
		}
		else if (mt == MixType.EaseInEaseOut) {
			if (p <= 0.5)
				p *= p * 2;
			else {
				p -= 0.5;
				p = Math.pow(p, 0.5) / Math.pow(0.5, 0.5) * 0.5;
				p += 0.5;
			}
			mt = MixType.Linear;
		}
		fSetP(p);
		fSetMt(mt);
	}
	static MixFloat(f1, f2, p, mt) {
		this.simplifyMixType(p, mt, (v) => { p = v; }, (v) => { mt = v; });
		if (mt == MixType.Linear)
			return f2 * p + f1 * (1 - p);
		else
			log("Not implemented mix type: " + mt)
	}
	static MixFont(f1, f2, p, mt) {
		return p < 0.5 ? f1 : f2;
	}
	static MixImage(i1, i2, p, mt) {
		this.simplifyMixType(p, mt, (v) => { p = v; }, (v) => { mt = v; });
		return p < 0.5 ? i1 : i2;
		//this.simplifyMixType((v) => { p = v; }, (v) => { mt = v; });
		//if (i1 == null || i2 == null)
		//	return null;
		//return new DXMixedImage(i1, i2, p);
		//return p < 0.5 ? i1 : i2;
	}
	static MixString(s1, s2, p, mt) {
		this.simplifyMixType(p, mt, (v) => { p = v; }, (v) => { mt = v; });
		return p < 0.5 ? s1 : s2;
	}
	static MixDXString(s1, s2, p, mt) {
		var str = new DXString();
		str.Text = VisualState.MixString(s1.Text, s2.Text, p, mt);
		str.Font = VisualState.MixFont(s1.Font, s2.Font, p, mt);
		str.Color = VisualState.MixColor(s1.Color, s2.Color, p, mt);
		return str;
	}
	static colorToRGB(col) {

		if (col.indexOf("rgb") >= 0) {
			// parse rgb
			col = col.substring(col.indexOf("(") + 1);
			var rS = col.substring(0, col.indexOf(","));
			col = col.substring(col.indexOf(",") + 1);
			var gS = col.substring(0, col.indexOf(","));
			col = col.substring(col.indexOf(",") + 1);
			var bS = "";
			var aS = "";
			if (col.indexOf(",") > 0) {
				bS = col.substring(0, col.indexOf(","));
				col = col.substring(col.indexOf(",") + 1);
				aS = col.substring(0, col.indexOf(")"));
			}
			else {
				bS = col.substring(0, col.indexOf(")"));
				aS = "1";
			}
			//log("[" + rS + "][" + gS + "][" + bS + "][" + aS + "]");
			//var c = col.match(/\d+(\.\d+)?%?/g);
			//if (c) {
			//	c = c.map(function (itm) {
			//		if (itm.indexOf('%') != -1) itm = parseFloat(itm) * 2.55;
			//		return parseInt(itm);
			//	});
			//}
			//if (c[3] == null)
			//	c[3] = 1;
			//var r = c[0];
			//var g = c[1];
			//var b = c[2];
			//var a = c[3];

			//return new Array(r, g, b, a);
			return new Array(parseFloat(rS), parseFloat(gS), parseFloat(bS), parseFloat(aS));
		}
		else if (col.indexOf("#") >= 0) {
			// parse hex
			col = col.substring(1);
			var bigint = parseInt(col, 16);
			var a = (bigint >> 24) & 255;
			var r = (bigint >> 16) & 255;
			var g = (bigint >> 8) & 255;
			var b = bigint & 255;
			if (col.length == 6)
				a = 1;
			return new Array(r, g, b, a);
		}
		else
		// parse name
		{
			return this.colorToRGB(this.colorNameToHex(col));
		}
	}


	static colorNameToHex(colour) {
		var colours = {
			"aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff",
			"beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887",
			"cadetblue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff",
			"darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f",
			"darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1",
			"darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dodgerblue": "#1e90ff",
			"firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff",
			"gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000", "greenyellow": "#adff2f",
			"honeydew": "#f0fff0", "hotpink": "#ff69b4",
			"indianred ": "#cd5c5c", "indigo": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c",
			"lavender": "#e6e6fa", "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2",
			"lightgrey": "#d3d3d3", "lightgreen": "#90ee90", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de",
			"lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6",
			"magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370d8", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee",
			"mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5",
			"navajowhite": "#ffdead", "navy": "#000080",
			"oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6",
			"palegoldenrod": "#eee8aa", "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#d87093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080",
			"rebeccapurple": "#663399", "red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1",
			"saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4",
			"tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "tomato": "#ff6347", "turquoise": "#40e0d0",
			"violet": "#ee82ee",
			"wheat": "#f5deb3", "white": "#ffffff", "whitesmoke": "#f5f5f5",
			"yellow": "#ffff00", "yellowgreen": "#9acd32"
		}

		if (typeof colours[colour.toLowerCase()] != 'undefined')
			return colours[colour.toLowerCase()];

		return false;
	}
	static MixColor(c1, c2, p, mt) {
		var f1 = this.colorToRGB(c1);
		var f2 = this.colorToRGB(c2);
		if (p < 0) return f1;
		if (p > 1) return f2;
		var ret = "rgba(" +
			this.MixFloat(f1[0], f2[0], p, mt) + "," +
			this.MixFloat(f1[1], f2[1], p, mt) + "," +
			this.MixFloat(f1[2], f2[2], p, mt) + "," +
			this.MixFloat(f1[3], f2[3], p, mt) + ")";
		//log("mix: " + c1 + " + " + c2 + " = " + ret);
		return ret;
	}
	MixStates(target, p, mt) {
		var finalState = this.Clone();

		// let the base do what it can do
		finalState.Left = VisualState.MixFloat(this.Left, target.Left, p, mt);
		finalState.Top = VisualState.MixFloat(this.Top, target.Top, p, mt);
		finalState.Width = VisualState.MixFloat(this.Width, target.Width, p, mt);
		finalState.Height = VisualState.MixFloat(this.Height, target.Height, p, mt);
		finalState.Opacity = VisualState.MixFloat(this.Opacity, target.Opacity, p, mt);
		finalState.Rotation = VisualState.MixFloat(this.Rotation, target.Rotation, p, mt);
		finalState.BorderThickness = VisualState.MixFloat(this.BorderThickness, target.BorderThickness, p, mt);
		finalState.Radius = VisualState.MixFloat(this.Radius, target.Radius, p, mt);
		finalState.ShadowSpread = VisualState.MixFloat(this.ShadowSpread, target.ShadowSpread, p, mt);
		finalState.ShadowIntensity = VisualState.MixFloat(this.ShadowIntensity, target.ShadowIntensity, p, mt);
		finalState.ShadowDistance = VisualState.MixFloat(this.ShadowDistance, target.ShadowDistance, p, mt);
		finalState.ShadowAngle = VisualState.MixFloat(this.ShadowAngle, target.ShadowAngle, p, mt);
		
		finalState.BorderColor = VisualState.MixColor(this.BorderColor, target.BorderColor, p, mt);
		finalState.FaceColor = VisualState.MixColor(this.FaceColor, target.FaceColor, p, mt);
		finalState.ShadowColor = VisualState.MixColor(this.ShadowColor, target.ShadowColor, p, mt);
		finalState.Text = VisualState.MixDXString(this.Text, target.Text, p, mt);
		//log("mix string: " + this.Text.Color + " + " + target.Text.Color + " = " + finalState.Text.Color);
		finalState.Image = VisualState.MixImage(this.Image, target.Image, p, mt);
		//finalState.ImageLocation = Mix(this.ImageLocation, target.ImageLocation, p, mt);
		return finalState;
	}
	NotifyAniamtionComplete() {
		this.OnAnimationComplete.Invoke(this, new EventArgs());
	}
	NotifyAniamtionStep() {
		this.OnAnimationStep.Invoke(this, new EventArgs());
	}
}
class VisualStateCollection {
	constructor(vs) {
		this.MouseHoverState = vs.Clone();
		this.NormalVisualState = vs.Clone();
		this.MouseDownState = vs.Clone();
		this.CurrentVisualState = vs.Clone();
	}
	SetupMouseClick(preset) {
		if (preset == VisualPresets.Levitate || preset == VisualPresets.LevitateWithLight) {
			var vs = this.NormalVisualState.Clone();
			vs.ShadowColor = preset == VisualPresets.Levitate ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
			vs.ShadowSpread = 3;
			var col = VisualState.colorToRGB(this.NormalVisualState.FaceColor);
			if (col[3] == 0)
				vs.FaceColor = "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",0.4)";
			this.SetupMouseClickVS(vs);
		}
		else if (preset == VisualPresets.EnlargeWithBorder) {
			var vs = this.NormalVisualState.Clone();
			vs.BorderColor = "rgba(100,100,100,1)";
			vs.BorderThickness = 1;
			this.SetupMouseClickVS(vs);
		}
	}
	SetupMouseClickVS(state) {
		this.MouseDownState = state.Clone();
		this.MouseDownState.AllowAutoTransition = true;
	}
	SetupMouseHover(preset) {
		if (preset == VisualPresets.Levitate || preset == VisualPresets.LevitateWithLight) {
			var vs = this.NormalVisualState.Clone();
			vs.ShadowColor = preset == VisualPresets.Levitate ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
			var col = VisualState.colorToRGB(this.NormalVisualState.FaceColor);
			if (col[3] == 0)
				vs.FaceColor = "white";
			vs.ShadowSpread = 8;
			vs.Width += 4;
			vs.Height += 4;
			vs.Left -= 2;
			vs.Top -= 2;
			this.NormalVisualState.ShadowColor = "rgba(255,255,255,0)";
			//if (NormalVisualState.FaceColor.A == 0)
			//{
			//	//vs.ForeColor = Color.FromArgb(255, NormalVisualState.ForeColor);
			//}
			this.SetupMouseHoverVS(vs);
		}
		else if (preset == VisualPresets.EnlargeWithBorder) {
			var vs = this.NormalVisualState.Clone();
			vs.Width += 4;
			vs.Height += 4;
			vs.Left -= 2;
			vs.Top -= 2;
			vs.BorderThickness = 1;
			vs.BorderColor = "rgba(100,100,100,1)";
			this.SetupMouseHoverVS(vs);
		}
	}


	IncrementAnchorPositions(dx, dy) {
		for (var i = 0; i < this.Link.DXControls.Count; i++) {
			if (control == null) {
				//log("Control null in: " + this.Link.Name);
				//log("Count: " + this.Link.DXControls.Count);
				continue;
			}
			var control = this.Link.DXControls[i];
			var r = control.Anchor.HasFlag(AnchorStyles.Right);
			var l = control.Anchor.HasFlag(AnchorStyles.Left);
			var t = control.Anchor.HasFlag(AnchorStyles.Top);
			var b = control.Anchor.HasFlag(AnchorStyles.Bottom);
			control.VisualStates.IncrementLocation(
				(!l && !r) ? (dx / 2) : ((r && !l) ? dx : 0),
				(!t && !b) ? (dy / 2) : ((b && !t) ? dy : 0));
			control.VisualStates.IncrementSize(
				(l && r) ? dx : 0,
				(t && b) ? dy : 0
			);
		}
	}


	SetupMouseHoverVS(state) {
		this.MouseHoverState = state.Clone();
		this.MouseHoverState.AllowAutoTransition = true;
		//MouseLeftState = DefaultVisualState.Clone();
		this.NormalVisualState.AllowAutoTransition = true;
		//this.Link.OnMouseEnter.Add((s, e) => { Link.SharedResources.PlayAudioAsync(this, audioKey); };
	}

	SetImage(img) {
		this.NormalVisualState.Image = img;
		this.MouseHoverState.Image= img;
		this.MouseDownState.Image = img;
		this.CurrentVisualState.Image = img;
	}
	SetLeft1(newLeft) {
		this.SetLeft2(newLeft, true);
	}
	SetLeft2(newLeft, relativeToNormal) {
		this.SetLocation2(new Point(newLeft, this.NormalVisualState.Top), relativeToNormal);
	}
	SetTop1(newTop) {
		this.SetTop2(newTop, true);
	}
	SetTop2(newTop, relativeToNormal) {
		this.SetLocation2(new Point(this.NormalVisualState.Left, newTop), relativeToNormal);
	}
	SetTopInRotation(newTop, relativeToNormal) {
		if (relativeToNormal == null)
			relativeToNormal = true;
		if (Math.abs(Math.round(this.NormalVisualState.Rotation, 0)) == 90)
			newTop += this.NormalVisualState.Width / 2 - this.NormalVisualState.Height / 2;
		this.SetTop2(newTop, relativeToNormal);
	}
	SetLeftInRotation(newLeft, relativeToNormal) {
		if (relativeToNormal == null)
			relativeToNormal = true;
		if (Math.abs(Math.round(this.NormalVisualState.Rotation, 0)) == 90)
			newLeft += -this.NormalVisualState.Width / 2 + this.NormalVisualState.Height / 2;
		this.SetLeft2(newLeft, relativeToNormal);
	}
	SetLocation1(newDefaultLocation) {
		this.SetLocation2(newDefaultLocation, true);
	}
	SetLocation2(newDefaultLocation, relativeToNormal) {
		var relX = newDefaultLocation.X - this.NormalVisualState.Left;
		var relY = newDefaultLocation.Y - this.NormalVisualState.Top;
		if (relativeToNormal) {
			this.NormalVisualState.Left += relX;
			this.NormalVisualState.Top += relY;
			this.MouseHoverState.Left += relX;
			this.MouseHoverState.Top += relY;
			this.MouseDownState.Left += relX;
			this.MouseDownState.Top += relY;
			this.CurrentVisualState.Left += relX;
			this.CurrentVisualState.Top += relY;
		}
		else {
			this.NormalVisualState.Left = newDefaultLocation.X;
			this.NormalVisualState.Top = newDefaultLocation.Y;
			this.MouseHoverState.Left = newDefaultLocation.X;
			this.MouseHoverState.Top = newDefaultLocation.Y;
			this.MouseDownState.Left = newDefaultLocation.X;
			this.MouseDownState.Top = newDefaultLocation.Y;
			this.CurrentVisualState.Left = newDefaultLocation.X;
			this.CurrentVisualState.Top = newDefaultLocation.Y;
		}
	}
	SetLocation3(x, y, relativeToNormal) {
		if (relativeToNormal == null)
			relativeToNormal = true;
		this.SetLocation2(
			new Point(x, y),
			relativeToNormal);
	}

	IncrementLocation(dx, dy) {
		this.SetLocation(new Point(this.NormalVisualState.Left + dx, this.NormalVisualState.Top + dy));
	}
	SetTextColor(col) {
		var st = this.NormalVisualState.Text;
		st.Color = col;
		SetText(st);
	}
	SetText(dxstring_) {
		this.NormalVisualState.Text = dxstring_.Clone();
		this.MouseHoverState.Text = dxstring_.Clone();
		this.MouseDownState.Text = dxstring_.Clone();
		this.CurrentVisualState.Text = dxstring_.Clone();
	}
	SetTextText(string_) {
		this.NormalVisualState.Text.Text = string_;
		this.MouseHoverState.Text.Text = string_;
		this.MouseDownState.Text.Text = string_;
		this.CurrentVisualState.Text.Text = string_;
	}
	SetTextHeight(height) {
		this.NormalVisualState.Text.Font.Height = height;
		this.MouseHoverState.Text.Font.Height = height;
		this.MouseDownState.Text.Font.Height = height;
		this.CurrentVisualState.Text.Font.Height = height;
	}
	SetFaceColor(fc) {
		this.NormalVisualState.FaceColor = fc;
		this.MouseHoverState.FaceColor = fc;
		this.MouseDownState.FaceColor = fc;
		this.CurrentVisualState.FaceColor = fc;
		if (fc == "rgba(10,136,197,0.2") {
			log(this.Link.toString() + " setting col " + fc);
			sd.saf();
		}
	}
	SetOpacity(op) {
		this.NormalVisualState.Opacity = op;
		this.MouseHoverState.Opacity = op;
		this.MouseDownState.Opacity = op;
		this.CurrentVisualState.Opacity = op;
	}
	SetRadius(r) {
		this.NormalVisualState.Radius = r;
		this.MouseHoverState.Radius = r;
		this.MouseDownState.Radius = r;
		this.CurrentVisualState.Radius = r;
	}
	SetRotation(r) {
		this.NormalVisualState.Rotation = r;
		this.MouseHoverState.Rotation = r;
		this.MouseDownState.Rotation = r;
		this.CurrentVisualState.Rotation = r;
	}
	SetBorderThickness(bt) {
		this.NormalVisualState.BorderThickness = bt;
		this.MouseHoverState.BorderThickness = bt;
		this.MouseDownState.BorderThickness = bt;
		this.CurrentVisualState.BorderThickness = bt;
	}
	SetBorderColor(bc) {
		this.NormalVisualState.BorderColor = bc;
		this.MouseHoverState.BorderColor = bc;
		this.MouseDownState.BorderColor = bc;
		this.CurrentVisualState.BorderColor = bc;
	}
	SetShadowColor(sc) {
		this.NormalVisualState.ShadowColor = sc;
		this.MouseHoverState.ShadowColor = sc;
		this.MouseDownState.ShadowColor = sc;
		this.CurrentVisualState.ShadowColor = sc;
	}
	SetShadowSpread(spread) {
		this.NormalVisualState.ShadowSpread = spread;
		this.MouseHoverState.ShadowSpread = spread;
		this.MouseDownState.ShadowSpread = spread;
		this.CurrentVisualState.ShadowSpread = spread;
	}
	IncrementLeft(dv) {
		this.IncrementLocation(dv, 0);
	}
	IncrementTop(dv) {
		this.IncrementLocation(0, dv);
	}
	IncrementLocation(dx, dy) {
		this.SetLocation(new Point(NormalVisualState.Left + dx, NormalVisualState.Top + dy));
	}
	SetSize(w, h, relativeToNormal) {
		this.SetWidth2(w, relativeToNormal);
		this.SetHeight2(h, relativeToNormal);
	}
	SetWidth(w) {
		this.SetWidth2(w, true);
	}
	SetWidth2(w, relativeToNormal) {
		var change = w - this.NormalVisualState.Width;
		this.IncrementSize3(change, 0, relativeToNormal);
	}
	SetHeight(h) {
		this.SetHeight2(h, true);
	}
	SetHeight2(h, relativeToNormal) {
		var change = h - this.NormalVisualState.Height;
		this.IncrementSize3(0, change, relativeToNormal);
	}
	IncrementWidth(dv) {
		this.IncrementWidth2(dv, true);
	}
	IncrementWidth2(dv, relativeToNormal) { this.IncrementSize3(dv, 0, relativeToNormal); }
	IncrementHeight(dv) {
		IncrementHeight2(dv, true);
	}
	IncrementHeight2(dv, relativeToNormal) { this.IncrementSize3(0, dv, relativeToNormal); }
	IncrementSize3(dx, dy, relativeToNormal) {
		if (dx == 0 && dy == 0)
			return;
		this.NormalVisualState.Width += dx;
		this.NormalVisualState.Height += dy;
		if (relativeToNormal) {
			this.MouseHoverState.Width += dx;
			this.MouseHoverState.Height += dy;
			this.MouseDownState.Width += dx;
			this.MouseDownState.Height += dy;
			this.CurrentVisualState.Width += dx;
			this.CurrentVisualState.Height += dy;
		}
		else {
			this.MouseHoverState.Width = this.NormalVisualState.Width;
			this.MouseHoverState.Height = this.NormalVisualState.Height;
			this.MouseDownState.Width = this.NormalVisualState.Width;
			this.MouseDownState.Height = this.NormalVisualState.Height;
			this.CurrentVisualState.Width = this.NormalVisualState.Width;
			this.CurrentVisualState.Height = this.NormalVisualState.Height;
		}
		//this.IncrementAnchorPositions(dx, dy);
	}

	AnimateInto(state, mt, duration) {

		if (duration == null)
			duration = 300;
		if (this.Link == null) {
			state.NotifyAniamtionComplete();
			return;
		}
		state.Link = this.Link;
		SharedResources.AnimateInto(this, state, mt, duration);
	}

	SetPropertyValue(prop, value) {
		super.SetPropertyValue(prop, value);
		if (prop == "min")
			this.SetMin(parseFloat(value));
		else if (prop == "max")
			this.SetMax(parseFloat(value));
	}
}
