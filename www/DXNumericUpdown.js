class DXNumericUpdown extends HTMLTextBoxWrapper {

    constructor(name, vs) {

        super(name, vs);
        this._format = "";
        this._suffix = "";
        this._prefix = "";
        this.Cursor = Cursors.SizeNS;
        this.OnMouseDown.Add(this.DXNumericUpdown_OnMouseDown);
        this.OnMouseUp.Add(this.DXNumericUpdown_OnMouseUp);
        this.OnMouseMove.Add(this.DXNumericUpdown_OnMouseMove);
        this.OnClick.Add(this.DXNumericUpdown_OnClick);
        this.VisualStates.SetText(new DXString("0", 30));

        this.LastMouse = new PointF();
        this.CurrentMoveOp = MoveOp.None;
        this.MouseDownAt = new PointF();
        this._min = 0;
        this._max = 10;
        this._val = 0;
        this.valueAtDown = 0;
        this.OnValueChanged = new EventHandler();
        this.fineMovement = false;
        this.isFirstMove = false;
        this.valueForMove = 0;
        this.lastDx = new List();
        this.lastDy = new List();
        this.NumbersOnly = true;
        this.OnTextChanged.Add((s, e) => {
            var v = parseFloat(s.Text);
            if (v < s.Minimum)
                v = s.Minimum;
            else if (v > s.Maximum)
                v = s.Maximum;
            s.Value = v;
        });
    }

    DXNumericUpdown_OnClick(sender, e) {
        //var tb = new DXTextBoxWrapper("editor", SharedResources, new PointF(0, 0), new SizeF(Width, Height), Color.Transparent, new DXString(SharedResources)
        //    { Text = Value.ToString(Format), DXFont = CurrentVisualState.Text.DXFont, Color = Color.Black })
        //{
        //    ImageAllignment = this.ImageAllignment,
        //        ImageToTextPadding = this.ImageToTextPadding,
        //    };
        //AddDXControl(tb);
        //tb.NotifyClick();
        //tb.OnTextChanged += (s2, e2) => {
        //    RemoveDXControl(tb);
        //    Value = float.Parse(tb.Text);
        //};
    }

    get Minimum() {
        return this._min;
    }
    set Minimum(value) {
        this._min = value;
        if (this.Value < this.Minimum)
            this.Value = this.Minimum;
        if (this.Maximum < this.Minimum)
            this.Maximum = this.Minimum;
    }
    get Maximum() {
        return this._max;
    }
    set Maximum(value) {
        this._max = value;
        if (this.Value > this.Maximum)
            this.Value = this.Maximum;
        if (this.Maximum < this.Minimum)
            this.Minimum = this.Maximum;
    }
    get Value() {
        return this._val;
    }
    set Value(value) {
        //log("value is: " + (value + 99));
        var newV = parseFloat(value.toFixed(2));
        var valueBkp = this._val;
        this._val = newV;
        if (this._val > this.Maximum)
            this._val = this.Maximum;
        if (this._val < this.Minimum)
            this._val = this.Minimum;
        this.VisualStates.SetTextText(this.Prefix + this._val.toFixed(2) + this.Suffix);
        if (newV != valueBkp)
            this.OnValueChanged.Invoke(this, new EventArgs());
    }
    get Suffix() {
        return this._suffix;
    }
    set Suffix(value) {
        this._suffix = value;
        this.VisualStates.SetTextText(this.Prefix + this.Value.toFixed(2) + this.Suffix);
    }
    get Prefix() {
        return this._prefix;
    }
    set Prefix(value) {
        this._prefix = value;
        this.VisualStates.SetTextText(this.Prefix + this.Value.toFixed(2) + this.Suffix);
    }

    DXNumericUpdown_OnMouseMove(sender, e) {
        var eLocForSaving = new PointF(
            e.Location.X,
            e.Location.Y);

        var eLoc = new PointF(
            e.Location.X,
            e.Location.Y);
        // cyclic mouse dragging
        if (sender.CurrentMoveOp == MoveOp.ValueUpDown) {
            var dx = eLoc.X - sender.LastMouse.X;
            var dy = eLoc.Y - sender.LastMouse.Y;

            sender.lastDx.Add(dx);
            sender.lastDy.Add(dy);
            if (sender.lastDx.Count > 5) {
                sender.lastDx.RemoveAt(0);
                sender.lastDy.RemoveAt(0);
                if (sender.lastDx.Sum((_dx) => {
                    return Math.abs(_dx);
                })
                    >=
                    sender.lastDy.Sum((_dy) => {
                        return Math.abs(_dy);
                    })) {
                    dy = 0;
                    sender.fineMovement = true;
                }
                else {
                    sender.fineMovement = false;
                }
            }
            sender.isFirstMove = false;
            if (sender.fineMovement)
                dy = 0;
            if (Math.abs(dx) > Math.abs(dy))
                dy = 0;

            var v = sender.valueForMove - dy / 1000 * (sender.Maximum - sender.Minimum) + dx / 400000 * (sender.Maximum - sender.Minimum);
            sender.valueForMove = v;
            var x = sender.MousePosition.X;
            var y = sender.MousePosition.Y;

            if (sender.Value == parseFloat(sender.valueForMove.toFixed(2)))
                return;
            sender.Value = (sender.valueForMove);
        }
        sender.LastMouse = new PointF(eLocForSaving.X + 0, eLocForSaving.Y + 0);
    }

    DXNumericUpdown_OnMouseDown(sender, e2) {
        sender.isFirstMove = sender;
        sender.valueForMove = sender._val;
        sender.CurrentMoveOp = MoveOp.ValueUpDown;

        sender.MouseDownAt = sender.LastMouse;
        sender.valueAtDown = sender._val;
        sender.lastDx = new List();
        sender.lastDy = new List();
    }
    DXNumericUpdown_OnMouseUp(sender, e) {
        sender.CurrentMoveOp = MoveOp.None;
        sender.ScreenLoopOffset = new PointF();
        sender.fineMovement = false;
    }
}
