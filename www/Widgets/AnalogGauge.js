class AnalogGauge extends RemoteWidget {

    constructor(name, vs) {
        super(name, vs);
        this.MinNUD = new DXNumericUpdown("min nud", new VisualState(0, 0, 100, 20));
        this.MinNUD.ImageAllignment = ContentAllignment.Fill_ImageOnLeft;
        this.MaxNUD = new DXNumericUpdown("max nud", new VisualState(0, 0, 100, 20));
        this.MaxNUD.ImageAllignment = ContentAllignment.Fill_ImageOnRight;
        this.MaxNUD.Maximum = 20;
        this.MaxNUD.Minimum = 0;
        this.MaxNUD.Value = 10;
        this.MinNUD.Maximum = 0;
        this.MinNUD.Minimum = -20;
        this.MinNUD.Value = -10;
        this.ValueCache = 0;
        this.Title = "Analog Gauge";
        //this.MaxNUD.VisualStates.SetBorderThickness(1);
        //this.MaxNUD.VisualStates.SetBorderColor(1);

        this.AddDXControl(this.MaxNUD);
        this.AddDXControl(this.MinNUD);
        this.NotifyUserResized();
    }
    Feed() {
        if (this.Quantity != null) {
            this.ValueCache = this.Quantity.getValue();
        }
    }
    BasePaint(g) {
        super.BasePaint(g);

        var minDim = Math.min(this.Width, this.Height);

        var xo = this.Width / 2 - minDim / 2;
        var yo = this.Height / 2 - minDim / 2;

        var xc = xo + minDim / 2;
        var yc = yo + minDim / 2;
        var ll = minDim * 0.05;
        var rText = minDim * 0.42;
        var maxSweep = 1.5 * Math.PI;
        var r = minDim * 0.6 / 2;
        var lastInner = null;
        for (var i = 0; i <= 10; i++)
        {
            for (var j = 0; j < (i == 10 ? 1 : 10); j++)
            {
                var ii = i + j / 10.0;
                var thi = maxSweep * ii / 10.0;
                var th = (Math.PI * 3 / 4 + thi);
                var x1 = xc + r * Math.cos(th);
                var y1 = yc + r * Math.sin(th);
                var x2 = xc + (r + ll * (j == 0 ? 1 : (j == 5) ? 0.7: 0.4)) * Math.cos(th);
                var y2 = yc + (r + ll * (j == 0 ? 1 : (j == 5) ? 0.7: 0.4)) * Math.sin(th);

                var Text = new DXString((this.MinNUD.Value + (this.MaxNUD.Value - this.MinNUD.Value) * i / 10.0).toFixed(1), minDim * 0.05);


                var p = new Pen('black', 1);
                g.DrawLine(p, new PointF(x1, y1), new PointF(x2, y2));


                if (lastInner != null) {
                    g.DrawLine(p, lastInner, new PointF(x1, y1));
                }
                lastInner = new PointF(x1, y1);
                if (ii == i) {
                    var x3 = xc + (rText) * Math.cos(th);
                    var y3 = yc + (rText) * Math.sin(th);
                    var sz = g.MeasureString(Text);
                    if (i != 0 && i != 10)
                        g.DrawString(Text, x3 - sz.Width / 2, y3 - sz.Height / 2);
                }
            }
        }


        var rt = minDim * 0.1 / 2;
        var NeedleColor = "black";

        if (this.ValueCache < this.MinNUD.Value) {
            this.ValueCache  = this.MinNUD.Value;
            NeedleColor = "Red";
        }
        if (this.ValueCache  > this.MaxNUD.Value) {
            this.ValueCache  = this.MaxNUD.Value;
            NeedleColor = "red";
        }
        var thSweep = (this.ValueCache  - this.MinNUD.Value) / (this.MaxNUD.Value - this.MinNUD.Value) * 3 * Math.PI / 2;
        var thl = -(Math.PI * 5 / 4) + thSweep;
        var thT1 = thl + Math.PI / 2;
        var thT2 = thl - Math.PI / 2;

        g.FillPath(NeedleColor,
            [
                xc + (6) * Math.cos(thT1),
                xc + (r - 1) * Math.cos(thl),
                xc + (6) * Math.cos(thT2)
            ],
            [
                yc + (5) * Math.sin(thT1),
                yc + (r - 1) * Math.sin(thl),
                yc + (5) * Math.sin(thT2)
            ]
        );
        g.FillCircle(NeedleColor, xc, yc, minDim * 0.02);
        Text = new DXString(this.Title, minDim * 0.06);
        sz = g.MeasureString(Text);
        g.DrawString(Text, xc - sz.Width / 2, yc + minDim / 3);
    }
    RemoveQuantity(loggerQuantity, msg) {
        this.Quantity = null;
    }
    SetQuantity(loggerQuantity, msg) {
        this.Quantity = loggerQuantity;
    }
    SetPropertyValue(prop, value) {
        if (prop == "min") {
            var v = parseFloat(value);
            if (this.MinNUD.Minimum > v)
                this.MinNUD.Minimum = v;
            if (this.MinNUD.Maximum < v)
                this.MinNUD.Maximum = v;
            this.MinNUD.Value = v;

            if (this.MaxNUD.Value < v) {
                if (this.MaxNUD.Minimum > v)
                    this.MaxNUD.Minimum = v;
                if (this.MaxNUD.Maximum < v)
                    this.MaxNUD.Maximum = v;
                this.MaxNUD.Value = v;
            }
            this.MinNUD.Minimum -= this.MaxNUD.Maximum - this.MinNUD.Value;
        }
        else if (prop == "max") {
            var v = parseFloat(value);
            if (this.MaxNUD.Minimum > v)
                this.MaxNUD.Minimum = v;
            if (this.MaxNUD.Maximum < v)
                this.MaxNUD.Maximum = v;
            this.MaxNUD.Value = v;

            if (this.MinNUD.Value > v) {
                if (this.MinNUD.Minimum > v)
                    this.MinNUD.Minimum = v;
                if (this.MinNUD.Maximum < v)
                    this.MinNUD.Maximum = v;
                this.MinNUD.Value = v;
            }
            this.MaxNUD.Maximum += this.MaxNUD.Maximum - this.MinNUD.Value;
        }
        else if (prop == "label")
            this.Title = value;
    }
    NotifyUserResized() {

        var minDim = Math.min(this.Width, this.Height);

        var xo = this.Width / 2 - minDim / 2;
        var yo = this.Height / 2 - minDim / 2;

        var xc = xo + minDim / 2;
        var yc = yo + minDim / 2;
        var ll = minDim * 0.05;
        var maxSweep = 1.5 * Math.PI;
        var r = minDim * 0.6 / 2;

        var i = 0;
        var j = 0;
        var ii = i + j / 10.0;
        var thi = maxSweep * ii / 10.0;
        var th = (Math.PI * 3 / 4 + thi);
        var x2 = xc + (r + ll + 3) * Math.cos(th);
        var y2 = yc + (r + ll + 3) * Math.sin(th);

        this.MinNUD.VisualStates.SetHeight(minDim * 0.05);
        this.MinNUD.VisualStates.SetWidth(x2 - 2);
        this.MinNUD.VisualStates.SetTextHeight(minDim * 0.05);
        this.MinNUD.VisualStates.SetLeft1(x2 - this.MinNUD.Width);
        this.MinNUD.VisualStates.SetTop1(y2);

        i = 10;
        ii = i + j / 10.0;
        thi = maxSweep * ii / 10.0;
        th = (Math.PI * 3 / 4 + thi);
        var x3 = xc + (r + ll + 3) * Math.cos(th);
        this.MaxNUD.VisualStates.SetHeight(minDim * 0.05);
        this.MaxNUD.VisualStates.SetWidth(x2 - 2);
        this.MaxNUD.VisualStates.SetTextHeight(minDim * 0.05);
        this.MaxNUD.VisualStates.SetLeft1(x3);
        this.MaxNUD.VisualStates.SetTop1(y2);
    }
}