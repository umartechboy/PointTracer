class Extrema extends RemoteWidget {

    minL_Click(sender, p) {
        var This = sender.Parent;
        This.minValue = This.ValueCache;
        This.minL.VisualStates.SetTextText(This.minValue.toFixed());
        This.NeedsToRedraw = true;
    }
    maxL_Click(sender, p) {
        var This = sender.Parent;
        This.maxValue = This.ValueCache;
        This.maxL.VisualStates.SetTextText(This.maxValue.toFixed());
        This.NeedsToRedraw = true;
    }
    constructor(name, vs) {
        super(name, vs);
        this.Quantity = null;
        this.minValue = 99999999;
        this.maxValue = -9999999;
        this.minL = new RectangularPatch("min", new VisualState);
        this.maxL = new RectangularPatch("max", new VisualState);
        this.valueL = new RectangularPatch("value", new VisualState);
        this.nameL = new RectangularPatch("name", new VisualState);
        this.minL.VisualStates.SetText(new DXString("0", 10));
        this.maxL.VisualStates.SetText(new DXString("0", 10));
        this.maxL.VisualStates.SetText(new DXString("0", 10));
        this.valueL.VisualStates.SetText(new DXString("0", 10));
        this.nameL.VisualStates.SetText(new DXString("Extrema", 10));

        this.minL.VisualStates.SetupMouseClick(VisualPresets.Press);
        this.maxL.VisualStates.SetupMouseClick(VisualPresets.Press);
        this.minL.OnClick.Add(this.minL_Click);
        this.maxL.OnClick.Add(this.maxL_Click);

        this.minL.VisualStates.SetupMouseHover(VisualPresets.EnlargeWithBorder);
        this.minL.VisualStates.SetupMouseClick(VisualPresets.EnlargeWithBorder);
        this.maxL.VisualStates.SetupMouseHover(VisualPresets.EnlargeWithBorder);
        this.maxL.VisualStates.SetupMouseClick(VisualPresets.EnlargeWithBorder);

        this.minL.OnMouseEnter.Add((s, e) => { s.VisualStates.SetTextText("Reset"); });
        this.maxL.OnMouseEnter.Add((s, e) => { s.VisualStates.SetTextText("Reset"); });
        this.minL.OnMouseLeave.Add((s, e) => {
            s.VisualStates.SetTextText(s.Parent.minValue.toFixed(2));
        });
        this.maxL.OnMouseLeave.Add((s, e) => {
            s.VisualStates.SetTextText(s.Parent.minValue.toFixed(2));
        });

        this.AddDXControl(this.minL);
        this.AddDXControl(this.maxL);
        this.AddDXControl(this.valueL);
        this.AddDXControl(this.nameL);
        this.NotifyUserResized();
    }
    NotifyUserResized() {
        this.nameL.VisualStates.SetSize(this.Width, this.Height * 0.2, false);
        this.nameL.VisualStates.SetLocation3(0, 0);

        this.valueL.VisualStates.SetSize(this.Width, this.Height * 0.5);
        this.valueL.VisualStates.SetLocation3(0, this.Height * 0.2);

        this.minL.VisualStates.SetSize(this.Width / 2, this.Height * 0.2, false);
        this.minL.VisualStates.SetLocation3(0, this.Height * 0.8);

        this.maxL.VisualStates.SetSize(this.Width / 2, this.Height * 0.2, false);
        this.maxL.VisualStates.SetLocation3(this.Width / 2, this.Height * 0.8);

        this.nameL.VisualStates.SetTextHeight(this.Height * 0.18);
        this.valueL.VisualStates.SetTextHeight(this.Height * 0.3);
        this.minL.VisualStates.SetTextHeight(this.Height * 0.18);
        this.maxL.VisualStates.SetTextHeight(this.Height * 0.18);
    }
    Feed() {
        if (this.Quantity != null) {
            var newV = this.Quantity.getValue();
            if (newV != this.ValueCache)
                this.NeedsToRedraw = true;
            this.ValueCache = newV;
            this.valueL.VisualStates.SetTextText(this.ValueCache.toFixed(2));
            if (this.ValueCache > this.maxValue) {
                this.maxValue = this.ValueCache;
                this.maxL.VisualStates.SetTextText(this.maxValue.toFixed(2));
            }
            if (this.ValueCache < this.minValue) {
                this.minValue = this.ValueCache;
                this.minL.VisualStates.SetTextText(this.minValue.toFixed(2));
            }
        }
    }
    RemoveQuantity(loggerQuantity, msg) {
        this.Quantity = null;
    }
    SetQuantity(loggerQuantity, msg) {
        this.Quantity = loggerQuantity;
    }
    SetPropertyValue(prop, value) {
        if (prop == "reset") {
            if (value == "min") {
                this.minValue = this.ValueCache;
                this.minL.VisualStates.SetTextText(this.maxValue.toFixed());
                this.NeedsToRedraw = true;
            }
            else if (value == "max") {
                maxValue = ValueCache;
                maxL.VisualStates.SetTextText(String(maxValue));
                NeedsToRedraw = true;
            }
        }
        else if (prop == "label") {
            this.label = value;
            this.nameL.VisualStates.SetTextText(value);
            this.NeedsToRedraw = true;
        }
    }
}