class UserControlledRemoteQuantity extends RemoteWidget {
    constructor(name, vs) {
        super(name, vs);
        this.OnColor = "rgba(1,201,36,1)";
        this.OffColor = "rgba(210,51,0,1)";
        this.TargetQuantity = null;
        this.firstValueFeed = true;
        this.lastValueFed = 0;
        this.Min = -1;
        this.Max = 1;
        this.label = "";
        this.titleTB = null;
    }
    Feed() {
        // we need to detect value changes so that we can sync the UI with the desktop app
        if (this.TargetQuantity == null) // don't check if the target is not set.
            return;
        if (this.firstValueFeed) {
            this.lastValueFed = this.GetValue();
            this.firstValueFeed = false;
            this.NotifyUserValueChanged(this.lastValueFed);
            return;
        }
        if (this.GetValue() != this.lastValueFed) {
            this.lastValueFed = this.GetValue();
            this.NotifyUserValueChanged(this.lastValueFed);
        }
    }
    GetValue() {
        if (this.TargetQuantity != null)
            return this.TargetQuantity.makeValue();
        return 0;
    }
    GetValueBool() {
        if (this.TargetQuantity != null)
            return this.GetValue() > (this.Max + this.Min) / 2;
        return false;
    }
    SetValue(value) {
        //log("SetValue");
        if (this.TargetQuantity != null)
            this.TargetQuantity.setValue(value);
    }
    SetValueBool(value) {
        if (this.TargetQuantity != null)
            this.TargetQuantity.setValue(value ? this.Max : this.Min);
    }
    NotifyUserValueChanged(value) {
    }
    SetPropertyValue(prop, value) {
        if (prop == "label") {
            this.label = value;
            this.titleTB.VisualStates.SetTextText(value);
        }
        else if (prop == "min") {
            this.Min = parseFloat(value);
            this.minTB.Value = this.Min;
        }
        else if (prop == "max") {
            this.Max = parseFloat(value);
            this.maxTB.Value = this.Max;
        }
    }
    SetQuantity(loggerQuantity, msg) {
        TargetQuantity = loggerQuantity;
    }
    RemoveQuantity(loggerQuantity, msg) {
        if (loggerQuantity == this.TargetQuantity)
            TargetQuantity = null;
    }

}

class ToggleSwitch extends UserControlledRemoteQuantity {
    constructor(name, vs) {
        super(name, vs);

        this.titleTB = new RectangularPatch("name", new VisualState(0, 0, 0, 0));
        this.titleTB.VisualStates.SetText(new DXString("Toggle Switch", 10));
        this.titleTB.ImageAllignment = ContentAllignment.Fill_ImageOnLeft;
        this.AddDXControl(this.titleTB);

        this.knobContainer = new RectangularPatch("knob container", new VisualState());
        this.knobContainer.VisualStates.SetLeft1(this.Width - this.Height / 2);
        this.knobContainer.VisualStates.SetWidth(this.Height / 2);
        this.knobContainer.VisualStates.SetRadius(-1);
        this.knobContainer.VisualStates.SetBorderThickness(2);
        this.knobContainer.VisualStates.SetFaceColor = "rgba(0,0,0,0)";
        this.knobContainer.VisualStates.SetBorderColor(this.OffColor);

        this.knob = new RectangularPatch("knob", new VisualState());
        this.knob.VisualStates.SetRadius(-1);
        this.knob.VisualStates.SetFaceColor("rgba(210,51,4,1)");
        this.knob.VisualStates.SetText(new DXString("0", 10, "white"));
        this.knob.Cursor = Cursors.Hand;

        this.knob.OnMouseUp.Add((s, e) => {
            //this.TSAnimateKnob(s, e);
            s = s.Parent.Parent;
            s.CanReceiveMouseClick = false;
            s.SetValueBool(!s.GetValueBool());

            var vs = s.knob.VisualStates.CurrentVisualState.Clone();
            vs.FaceColor = "rgba(180,180,180,1)";
            s.knob.VisualStates.AnimateInto(vs, MixType.EaseOut);
            vs = s.knobContainer.VisualStates.CurrentVisualState.Clone();
            vs.BorderColor = "rgba(180,180,180,1)";
            s.knobContainer.VisualStates.AnimateInto(vs, MixType.EaseOut);
        });
        this.knobContainer.AddDXControl(this.knob);
        this.AddDXControl(this.knobContainer);
        this.NotifyUserResized();
        this.NotifyUserValueChanged();
    }

    TSAnimateKnob(s) {

        //log("s: " + s.Name);
        //log("s.Parent: " + s.Parent.Name);
        //log("s.Parent.Parent: " + s.Parent.Parent.Name);
        s = s.Parent.Parent;

        s.CanReceiveMouseClick = true;
        //if (s.Value > 0.5)
        //    s.Value = 0;
        //else
        //    s.Value = 1;
        var Value = s.GetValueBool();
        //log("anim Value: " + Value);
        var vs = s.knob.VisualStates.CurrentVisualState.Clone();
        vs.Top = (Value < 0.5) ? 3 : s.knobContainer.Height - s.knob.Height - 3;
        vs.FaceColor = (Value > 0.5) ? s.OnColor : s.OffColor;
        vs.Text.Text = (Value > 0.5) ? "1" : "0";

        s.knob.VisualStates.AnimateInto(vs, MixType.EaseOut);
        var vs = s.knobContainer.VisualStates.CurrentVisualState.Clone();
        vs.BorderColor = (Value > 0.5) ? s.OnColor : s.OffColor;
        s.knobContainer.VisualStates.AnimateInto(vs, MixType.EaseOut);
    }

    NotifyUserResized() {
        this.knobContainer.VisualStates.SetWidth(this.Height / 2);
        this.knobContainer.VisualStates.SetHeight(this.Height);
        this.knobContainer.VisualStates.SetLeft1(this.Width - this.knobContainer.Width);
        this.knobContainer.VisualStates.SetRadius(this.Height / 2 / 2 - 2);

        this.knob.VisualStates.SetWidth(this.knobContainer.Width - 3 * 2);
        this.knob.VisualStates.SetHeight(this.knobContainer.Width - 3 * 2);
        this.knob.VisualStates.SetTop1((this.GetValueBool() < 0.5) ? 3 : this.Height - 3 - this.knob.Height);
        this.knob.VisualStates.SetLeft1(3);
        this.knob.VisualStates.SetTextHeight(this.knobContainer.Width * 0.6);
        this.knob.VisualStates.SetRadius(-1);

        this.titleTB.VisualStates.SetWidth(this.knobContainer.Left - this.Height / 10);
        this.titleTB.VisualStates.SetLeft1(0);
        this.titleTB.VisualStates.SetTop1(0);
        this.titleTB.VisualStates.SetHeight(this.Height);
        this.titleTB.VisualStates.SetTextHeight(this.Height * 0.6);
        this.knob.VisualStates.SetFaceColor((this.GetValueBool() > 0.5) ? this.OnColor : this.OffColor);
        this.knob.VisualStates.SetTextText((this.GetValueBool() > 0.5) ? "1" : "0");
        this.knob.VisualStates.SetRadius(-1);
        this.knobContainer.VisualStates.SetRadius(-1);
        this.knobContainer.VisualStates.SetBorderColor((this.GetValueBool() > 0.5) ? this.OnColor : this.OffColor);
    }

    SetOutputValue(valueToApply) {
        valueToApply = valueToApply > 0.5 ? this.Max : this.Min;
        //log("SetOutputValue");
        this.SetValue(valueToApply);
    }

    NotifyUserValueChanged(f) {
        if ((parseFloat(this.knob.VisualStates.CurrentVisualState.Text.Text) < 0.5 && f >= (this.Max + this.Min) / 2)
        ||
            (parseFloat(this.knob.VisualStates.CurrentVisualState.Text.Text) >= 0.5 && f < (this.Max + this.Min) / 2))
        {
            log("Terminal value change on TS: " + this.GetValueBool());
            this.TSAnimateKnob(this.knob);
        }
    }
}

class PushButton extends UserControlledRemoteQuantity {
    constructor(name, vs) {
        super(name, vs);
        this.titleTB = new RectangularPatch("name", new VisualState(0, 0, 0, 0));
        this.titleTB.VisualStates.SetText(new DXString("Push button", 10));
        this.titleTB.ImageAllignment = ContentAllignment.Fill_ImageOnLeft;
        this.AddDXControl(this.titleTB);

        this.knobContainer = new RectangularPatch("knob container", new VisualState(this.Width - this.Height / 2, 0, this.Height / 2, this.Height / 2 / 2 - 2));
        this.knobContainer.VisualStates.SetBorderThickness(2);
        this.knobContainer.VisualStates.SetBorderColor(this.OffColor);
        this.knob = new RectangularPatch("knob", new VisualState(0, 0, 0, 0));
        this.knob.VisualStates.SetRadius(-1);
        this.knob.VisualStates.SetFaceColor("rgba(210,51,4,1)");
        this.knob.Cursor = Cursors.Hand;
        this.knob.VisualStates.SetupMouseHover(VisualPresets.Levitate);
        this.knob.VisualStates.SetupMouseClick(VisualPresets.Levitate);
        this.knob.VisualStates.MouseDownState.FaceColor = this.OnColor;
        this.knob.VisualStates.MouseDownState.ShadowColor = "rgba(1,201,36,0.4)";
        this.knob.VisualStates.MouseHoverState.ShadowColor = "rgba(210,51,0,0.4)";
        this.knob.OnMouseDown.Add((s, e) => {
            s = s.Parent.Parent;
            s.knobContainer.VisualStates.SetBorderColor(s.OnColor);
            s.SetValueBool(1);
            log("PB Mouse Down");
        });
        this.knob.OnMouseUp.Add((s, e) => {
            s = s.Parent.Parent;
            s.knobContainer.VisualStates.SetBorderColor(s.OffColor);
            s.SetValueBool(0);
            log("PB Mouse Up");
        });
        this.knobContainer.AddDXControl(this.knob);
        this.AddDXControl(this.knobContainer);
        this.NotifyUserResized();
    }
    NotifyUserResized() {
        this.knobContainer.VisualStates.SetHeight(this.Height);
        this.knobContainer.VisualStates.SetWidth(this.Height);
        this.knobContainer.VisualStates.SetLeft1(this.Width - this.knobContainer.Width);
        this.knobContainer.VisualStates.SetRadius(this.Height / 2 - 0.1);

        this.knob.VisualStates.SetLeft1(3);
        this.knob.VisualStates.SetTop1(3);
        this.knob.VisualStates.SetWidth(this.knobContainer.Width - 3 * 2);
        this.knob.VisualStates.SetHeight(this.knobContainer.Width - 3 * 2);
        this.knob.VisualStates.SetRadius(-1);

        this.titleTB.VisualStates.SetWidth(this.Width - this.knobContainer.Width - 10);
        this.titleTB.VisualStates.SetHeight(this.Height);
        this.titleTB.VisualStates.SetLeft1(0);
        this.titleTB.VisualStates.SetTop1(this.Height / 2 - this.titleTB.Height / 2);
        this.titleTB.VisualStates.SetTextHeight(this.titleTB.Height * 0.6);
        this.knob.VisualStates.SetRadius(-1);
        this.knobContainer.VisualStates.SetRadius(-1);
    }
    NotifyUserValueChanged(f) {
        if ((parseFloat(this.knob.VisualStates.CurrentVisualState.Text.Text) < 0.5 && f >= (this.Max + this.Min) / 2)
            ||
            (parseFloat(this.knob.VisualStates.CurrentVisualState.Text.Text) >= 0.5 && f < (this.Max + this.Min) / 2)) {
            log("Terminal value change on TS: " + this.GetValueBool());
            this.TSAnimateKnob(this.knob);
        }
    }
}

class ManualTextEntryWidgetExt extends UserControlledRemoteQuantity {
    constructor(name, vs) {
        super(name, vs);
        this.titleTB = new RectangularPatch("title", new VisualState());
        this.titleTB.VisualStates.SetText(new DXString("User Entry", 10));
        this.titleTB.ImageAllignment = ContentAllignment.Center_ImageOnLeft;
        this.AddDXControl(this.titleTB);
        this.ValueTB = new DXNumericUpdown("value", new VisualState());
        this.ValueTB.Minimum = -10000;
        this.ValueTB.Maximum = 10000;
        this.ValueTB.VisualStates.SetText(new DXString("0", 10));
        this.ValueTB.ImageAllignment = ContentAllignment.Center_ImageOnLeft;
        this.ValueTB.OnTextChanged.Add(this.ValueOnTextChanged);
        this.ValueTB.NumbersOnly = true;
        this.AddDXControl(this.ValueTB);
        this.NotifyUserResized();

    }
    ValueOnTextChanged(sender) {
        var newString = sender.VisualStates.CurrentVisualState.Text.Text;
        sender.VisualStates.SetTextText((parseFloat(newString)).toFixed(2));
        sender.Parent.SetValue(parseFloat(newString));
    }
    NotifyUserValueChanged(v) {
        this.ValueTB.VisualStates.SetTextText(v.toFixed(2));
    }
    NotifyUserResized() {
        this.titleTB.VisualStates.SetWidth(this.Width);
        this.titleTB.VisualStates.SetHeight(this.Height * 0.4);
        this.titleTB.VisualStates.SetLeft1(0);
        this.titleTB.VisualStates.SetTop1(0);
        this.titleTB.VisualStates.SetTextHeight(this.titleTB.Height * 0.9);

        this.ValueTB.VisualStates.SetWidth(this.Width);
        this.ValueTB.VisualStates.SetHeight(this.Height * 0.6);
        this.ValueTB.VisualStates.SetLeft1(0);
        this.ValueTB.VisualStates.SetTop1(this.Height * 0.4);
        this.ValueTB.VisualStates.SetTextHeight(this.ValueTB.Height * 0.9);
    }
}


class UserControlledSlider extends UserControlledRemoteQuantity {
    constructor(name, vs) {
        super(name, vs);
    }

    NotifyUserValueChanged(value) {
        if (value > this.Max)
            value = this.Max;
        else if (value < this.Min)
            value = this.Min;
        this.knob.VisualStates.SetTextText(value.toFixed(2));
        this.NotifyUserResized();
    }
    SetMin(value) {
        this.Min = value;
        this.minTB.VisualStates.SetTextText(this.Min.toFixed(2));
        this.NotifyUserResized();
    }
    SetMax(value) {
        this.Max = value;
        this.maxTB.VisualStates.SetTextText(this.Max.toFixed(2));
        this.NotifyUserResized();
    }
    hSlider_MouseDown(sender, p) {
        var This = (sender.Parent.Parent);
        this.mouseIsDown = true;
        this.mouseDownAt = this.MousePosition ;
        this.knobAtMouseDown = this.knob.Left();
    }
    hSlider_MouseUp(sender, p) {
        var This = sender.Parent.Parent;
        this.mouseIsDown = false;
    }
    hSlider_MouseMove(sender, p) {
        var This = sender.Parent.Parent;
        if (this.mouseIsDown) {
            var dv = this.MousePosition .X - this.mouseDownAt.X;
            var left2 = this.knobAtMouseDown + dv;
            if (left2 < 1)
                left2 = 1;
            else if (left2 > this.knobContainer.Width - 2 - this.knob.Width)
                left2 = this.knobContainer.Width - 2 - this.knob.Width;
            this.knob.VisualStates.SetLeft(left2);
            var fraction = (this.knob.Left() - 2) / (this.knobContainer.Width - 4 - this.knob.Width);
            if (fraction < 0)
                fraction = 0;
            else if (fraction > 1)
                fraction = 1;
            var valueToApply = this.Min + (this.Max - this.Min) * fraction;
            this.SetValue(valueToApply);
            this.knob.VisualStates.SetText(valueToApply.toFixed(2));
            this.NotifyUserResized();
            this.NeedsToRedraw = true;
        }
    }
}
class HorizontalSlider extends UserControlledSlider {
    constructor(name, vs) {
        super(name, vs);

        this.mouseIsDown = false;
        this.mouseDownAt = new PointF();
        this.knobContainer = new RectangularPatch("knob container", new VisualState())
        this.knobContainer.VisualStates.SetBorderThickness(1);
        this.knobContainer.VisualStates.SetRadius(-1);
        this.knobContainer.VisualStates.SetBorderColor("black");

        this.titleTB = new RectangularPatch("titleTB", new VisualState());
        this.titleTB.VisualStates.SetSize(this.Width, 120);
        this.titleTB.VisualStates.SetText(new DXString(""));

        this.minTB = new DXNumericUpdown("minTB", new VisualState());
        this.minTB.VisualStates.SetLocation1(new PointF(1, 0));
        this.minTB.VisualStates.SetSize(100, this.knobContainer.Height);
        this.minTB.OnValueChanged.Add((s, e) => {
            this.Min = this.minTB.Value;
            this.NotifyUserResized();
        });

        this.maxTB = new DXNumericUpdown("maxTB", new VisualState());
        this.maxTB.VisualStates.SetLocation1(new PointF(this.knobContainer.Width - 100 - 1, 0));
        this.maxTB.VisualStates.SetSize(100, this.knobContainer.Height);
        this.maxTB.OnValueChanged.Add((s, e) => {
            this.Max = this.maxTB.Value;
            this.NotifyUserResized();
        });
        this.knob = new RectangularPatch("knob", new VisualState());
        this.knob.VisualStates.SetFaceColor("rgba(10,136,197,1)");
        this.knob.VisualStates.SetText(new DXString("0", 10, "white"));
        this.knob.Cursor = Cursors.Hand;
        this.knob.VisualStates.SetRadius(-1);
        this.knob.VisualStates.SetupMouseHover(VisualPresets.Levitate);
        this.knob.VisualStates.SetupMouseClick(VisualPresets.Levitate);

        this.knob.OnMouseDown.Add((s, p) => {
            var This = s.Parent.Parent;
            This.mouseIsDown = true;
            This.mouseDownAt = this.MousePosition;
            This.knobAtMouseDown = This.knob.Left;
        });
        this.knob.OnMouseMove.Add((s, p) => {
            var This = s.Parent.Parent;
            if (This.mouseIsDown) {
                var dv = this.MousePosition.X - This.mouseDownAt.X;
                var left2 = This.knobAtMouseDown + dv;
                if (left2 < 1)
                    left2 = 1;
                else if (left2 > This.knobContainer.Width - 2 - This.knob.Width)
                    left2 = This.knobContainer.Width - 2 - This.knob.Width;
                This.knob.VisualStates.SetLeft1(left2);
                var fraction = (This.knob.Left - 2) / (This.knobContainer.Width - 4 - This.knob.Width);
                if (fraction < 0)
                    fraction = 0;
                else if (fraction > 1)
                    fraction = 1;
                var valueToApply = This.Min + (This.Max - This.Min) * fraction;
                This.SetValue(valueToApply);
                This.knob.VisualStates.SetTextText(valueToApply.toFixed(2));
                This.NeedsToRedraw = true;
            }
        });
        this.knob.OnMouseUp.Add((s, e) => {
            var This = s.Parent.Parent;
            This.mouseIsDown = false;
        });
        
        this.knobShadow = new RectangularPatch("knobshadow", new VisualState());
        this.knobShadow.VisualStates.SetFaceColor("rgba(10,136,197,0.2)");
        this.knobShadow.CanReceiveMouseClick = false;
        this.knobShadow.CanReceiveMouseMove = false;
        this.knobShadow.VisualStates.SetText(new DXString("0", 10, "white"));
        this.knobShadow.Cursor = Cursors.Hand;
        this.knobShadow.VisualStates.SetRadius(-1);


        this.AddDXControl(this.titleTB);
        this.knobContainer.AddDXControl(this.minTB);
        this.knobContainer.AddDXControl(this.maxTB);
        this.knobContainer.AddDXControl(this.knobShadow);
        this.knobContainer.AddDXControl(this.knob);
        this.AddDXControl(this.knobContainer);
        this.NotifyUserResized();
    }
    NotifyUserResized() {
        this.titleTB.VisualStates.SetWidth(this.Width);
        this.titleTB.VisualStates.SetHeight(this.Height * 0.4);
        this.titleTB.VisualStates.SetTextHeight(this.Height * 0.3);

        this.knobContainer.VisualStates.SetLeft1(0);
        this.knobContainer.VisualStates.SetTop1(this.Height * 0.4);
        this.knobContainer.VisualStates.SetWidth(this.Width);
        this.knobContainer.VisualStates.SetHeight(this.Height * 0.6);
        this.knobContainer.VisualStates.SetRadius(-1);

        this.knob.VisualStates.SetTop1(1);
        this.knob.VisualStates.SetWidth(this.knobContainer.Height * 2 - 2);
        this.knob.VisualStates.SetHeight(this.knobContainer.Height - 2);
        this.knobShadow.VisualStates.SetTop1(1);
        this.knobShadow.VisualStates.SetWidth(this.knobContainer.Height * 2 - 2);
        this.knobShadow.VisualStates.SetHeight(this.knobContainer.Height - 2);
        var fraction = (this.knob.Left - 2) / (this.knobContainer.Width - 4 - this.knob.Width);
        if (fraction < 0)
            fraction = 0;
        else if (fraction > 1)
            fraction = 1;

        var val = this.GetValue();
        if (val < this.Min) val = this.Min;
        if (val > this.Max) val = this.Max;
        this.knob.VisualStates.SetLeft1((val - this.Min) / (this.Max - this.Min) * (this.knobContainer.Width - 4 - this.knob.Width) + 2);
        this.knob.VisualStates.SetTextHeight(this.Height * 0.3);


        this.knobShadow.VisualStates.SetLeft1((val - this.Min) / (this.Max - this.Min) * (this.knobContainer.Width - 4 - this.knob.Width) + 2);
        this.knobShadow.VisualStates.SetTextHeight(this.Height * 0.3);

        this.minTB.VisualStates.SetTextHeight(this.Height * 0.3);
        this.maxTB.VisualStates.SetTextHeight(this.Height * 0.3);
        this.minTB.VisualStates.SetTop1(1);
        this.maxTB.VisualStates.SetTop1(1);

        this.minTB.VisualStates.SetWidth(this.knobContainer.Height * 2);
        this.maxTB.VisualStates.SetWidth(this.knobContainer.Height * 2);

        this.minTB.VisualStates.SetHeight(this.knobContainer.Height - 2);
        this.maxTB.VisualStates.SetHeight(this.knobContainer.Height - 2);

        this.minTB.VisualStates.SetLeft1(1);
        this.maxTB.VisualStates.SetLeft1(this.knobContainer.Width - this.maxTB.Width - 1);

        this.minTB.VisualStates.SetRadius(-1);
        this.maxTB.VisualStates.SetRadius(-1);
        this.knob.VisualStates.SetRadius(-1);
        this.knobContainer.VisualStates.SetRadius(-1);
    }
    SetPropertyValue(prop, value) {
        if (prop == "min") {
            this.minTB.Minimum = parseFloat(value) - 10;
            this.minTB.Value = parseFloat(value);
            this.SetMin(parseFloat(value));
            this.Min = parseFloat(value);
        }
        else if (prop == "max")
        {
            this.maxTB.Maximum = parseFloat(value) + 10;
            this.maxTB.Value = parseFloat(value);
            this.SetMax(parseFloat(value));
            this.Max = parseFloat(value);
        }
        else
            super.SetPropertyValue(prop, value);
        this.NeedsToRedraw = true;
    }
    NotifyUserValueChanged(f) {
        log("Terminal value change on HS: " + this.GetValue());

        var val = this.GetValue();
        if (val < this.Min) val = this.Min;
        if (val > this.Max) val = this.Max;
        this.knobShadow.VisualStates.SetLeft1((val - this.Min) / (this.Max - this.Min) * (this.knobContainer.Width - 4 - this.knob.Width) + 2);
        this.knobShadow.VisualStates.SetTextText(val.toFixed(2));

    }
}


class VerticalSlider extends UserControlledSlider {
    constructor(name, vs) {
        super(name, vs);

        this.mouseIsDown = false;
        this.mouseDownAt = new PointF();
        this.knobContainer = new RectangularPatch("knob container", new VisualState())
        this.knobContainer.VisualStates.SetBorderColor("black");
        this.knobContainer.VisualStates.SetBorderThickness(1);
        this.knobContainer.VisualStates.SetRadius(-1);

        this.titleTB = new RectangularPatch("titleTB", new VisualState());
        this.titleTB.VisualStates.SetTextHeight(this.titleTB.Height);
        this.titleTB.VisualStates.SetRotation(-90);

        this.minTB = new DXNumericUpdown("minTB", new VisualState());
        this.minTB.VisualStates.SetLeft1(1);
        this.minTB.VisualStates.SetSize(this.Width * 0.8, this.knobContainer.Height);
        this.minTB.VisualStates.SetRotation(-90);
        this.minTB.VisualStates.SetTextHeight(this.Min.toFixed());
        this.minTB.VisualStates.SetTextHeight(this.minTB.Height);
        this.minTB.OnValueChanged.Add((s, e) => {
            this.Min = this.minTB.Value;
            this.NotifyUserResized();
        });

        this.maxTB = new DXNumericUpdown("maxTB", new VisualState());
        this.maxTB.VisualStates.SetLeft1(this.knobContainer.Width - 50 - 1);
        this.maxTB.VisualStates.SetSize(this.Width * 0.8, this.knobContainer.Height);
        this.maxTB.VisualStates.SetRotation(-90);
        this.maxTB.VisualStates.SetTextHeight(this.Max.toFixed());
        this.maxTB.VisualStates.SetTextHeight(this.maxTB.Height);
        this.maxTB.OnValueChanged.Add((s, e) => {
            this.Max = this.maxTB.Value;
            this.NotifyUserResized();
        });
        this.knob = new RectangularPatch("knob", new VisualState());
        this.knob.VisualStates.SetSize(this.Width * 0.8, this.knobContainer.Height);
        this.knob.VisualStates.SetTextText("0");
        this.knob.VisualStates.SetText(new DXString("0",10, "white"));
        this.knob.VisualStates.SetFaceColor("rgba(10,136,197,1)");
        this.knob.VisualStates.SetTextHeight(this.maxTB.Height);
        this.knob.VisualStates.SetRotation(-90);
        this.knob.VisualStates.SetRadius(-1);
        this.knob.VisualStates.SetupMouseHover(VisualPresets.Levitate);
        this.knob.VisualStates.SetupMouseClick(VisualPresets.Levitate);

        this.knob.OnMouseDown.Add((s, p) => {
            var This = s.Parent.Parent;
            This.mouseIsDown = true;
            This.mouseDownAt = this.MousePosition;
            This.knobAtMouseDown = This.knob.TopInRotation;
        });
        this.knob.OnMouseMove.Add((s, p) => {
            var This = s.Parent.Parent;
            if (This.mouseIsDown) {

                var dv = this.MousePosition.Y - This.mouseDownAt.Y;
                var top2 = This.knobAtMouseDown + dv;
                if (top2 < 1)
                    top2 = 1;
                else if (top2 > This.knobContainer.Height - 2 - This.knob.Width)
                    top2 = This.knobContainer.Height - 2 - This.knob.Width;
                This.knob.VisualStates.SetTopInRotation(top2);
                var fraction = (This.knob.TopInRotation - 2) / (This.knobContainer.Height - 4 - This.knob.Width);
                if (fraction < 0)
                    fraction = 0;
                else if (fraction > 1)
                    fraction = 1;
                var valueToApply = This.Min + (This.Max - This.Min) * (1 - fraction);
                This.SetValue(valueToApply);
                This.knob.VisualStates.SetTextText(valueToApply.toFixed(2));
                This.NeedsToRedraw = true;
            }
        });
        this.knob.OnMouseUp.Add((s, e) => {
            var This = s.Parent.Parent;
            This.mouseIsDown = false;
        });


        this.knobShadow = new RectangularPatch("vknobshadow", new VisualState());
        this.knobShadow.VisualStates.SetSize(this.Width * 0.8, this.knobContainer.Height);
        this.knobShadow.VisualStates.SetTextText("0");
        this.knobShadow.VisualStates.SetText(new DXString("0", 10, "white"));
        this.knobShadow.VisualStates.SetFaceColor("rgba(10,136,197,0.2)");
        this.knobShadow.VisualStates.SetTextHeight(this.maxTB.Height);
        this.knobShadow.VisualStates.SetRotation(-90);
        this.knobShadow.VisualStates.SetRadius(-1);


        this.AddDXControl(this.titleTB);
        this.knobContainer.AddDXControl(this.minTB);
        this.knobContainer.AddDXControl(this.maxTB);
        this.knobContainer.AddDXControl(this.knobShadow);
        this.knobContainer.AddDXControl(this.knob);
        this.AddDXControl(this.knobContainer);
        this.NotifyUserResized();
    }
    NotifyUserResized() {
        this.titleTB.VisualStates.SetWidth(this.Height);
        this.titleTB.VisualStates.SetHeight(this.Width * 0.4);
        this.titleTB.VisualStates.SetLeftInRotation(0);
        this.titleTB.VisualStates.SetTopInRotation(0);
        this.titleTB.VisualStates.SetTextHeight(this.Width * 0.3);

        this.knobContainer.VisualStates.SetLeft1(this.Width * 0.4);
        this.knobContainer.VisualStates.SetTop1(0);
        this.knobContainer.VisualStates.SetWidth(this.Width * 0.6);
        this.knobContainer.VisualStates.SetHeight(this.Height);

        this.knob.VisualStates.SetWidth(this.knobContainer.Width * 2 - 2);
        this.knob.VisualStates.SetHeight(this.knobContainer.Width - 2);
        this.knob.VisualStates.SetLeftInRotation(1);
        this.knobShadow.VisualStates.SetWidth(this.knobContainer.Width * 2 - 2);
        this.knobShadow.VisualStates.SetHeight(this.knobContainer.Width - 2);
        this.knobShadow.VisualStates.SetLeftInRotation(1);

        var val = this.GetValue();
        if (val < this.Min) val = this.Min;
        if (val > this.Max) val = this.Max;
        this.knob.VisualStates.SetTopInRotation((1 - (val - this.Min) / (this.Max - this.Min)) * (this.knobContainer.Height - 4 - this.knob.Width) + 2);
        this.knob.VisualStates.SetTextHeight(this.Width * 0.3);
        this.knobShadow.VisualStates.SetTopInRotation((1 - (val - this.Min) / (this.Max - this.Min)) * (this.knobContainer.Height - 4 - this.knob.Width) + 2);
        this.knobShadow.VisualStates.SetTextHeight(this.Width * 0.3);


        this.minTB.VisualStates.SetWidth(this.knobContainer.Width * 2);
        this.maxTB.VisualStates.SetWidth(this.knobContainer.Width * 2);
        this.minTB.VisualStates.SetHeight(this.knobContainer.Width - 2);
        this.maxTB.VisualStates.SetHeight(this.knobContainer.Width - 2);

        this.minTB.VisualStates.SetTextHeight(this.Width * 0.3);
        this.maxTB.VisualStates.SetTextHeight(this.Width * 0.3);

        this.minTB.VisualStates.SetLeftInRotation(1);
        this.maxTB.VisualStates.SetLeftInRotation(1);

        this.minTB.VisualStates.SetTopInRotation(this.knobContainer.Height - this.minTB.Width - 1);
        this.maxTB.VisualStates.SetTopInRotation(1);
        this.knob.VisualStates.SetRadius(-1);
        this.knobContainer.VisualStates.SetRadius(-1);
    }
    SetPropertyValue(prop, value) {
        if (prop == "min") {
            this.minTB.Minimum = parseFloat(value) - 10;
            this.minTB.Value = parseFloat(value);
            this.SetMin(parseFloat(value));
            this.Min = parseFloat(value);
        }
        else if (prop == "max") {
            this.maxTB.Maximum = parseFloat(value) + 10;
            this.maxTB.Value = parseFloat(value);
            this.SetMax(parseFloat(value));
            this.Max = parseFloat(value);
        }
        else
            super.SetPropertyValue(prop, value);
        this.NeedsToRedraw = true;
    }
    NotifyUserValueChanged(f) {
        log("Terminal value change on VS: " + this.GetValue());

        var val = this.GetValue();
        if (val < this.Min) val = this.Min;
        if (val > this.Max) val = this.Max;
        this.knobShadow.VisualStates.SetTopInRotation((1 - (val - this.Min) / (this.Max - this.Min)) * (this.knobContainer.Height - 4 - this.knob.Width) + 2);
        this.knobShadow.VisualStates.SetTextText(val.toFixed(2));
    }
}