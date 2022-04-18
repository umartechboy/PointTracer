class WidgetPagesCollection extends RectangularPatch {
    constructor(name, vs) {
        super(name, vs);
        this.Pages = new List();
        this.CurrentPage = null;
        this.VisualStates.SetText(new DXString("You haven not added anything to the workspace yet.", 20, "rgba(150,150,150,1)"));
    }
    AddNewPage() {
        var page = new WidgetHolder(this.Pages.Count.toString(), new VisualState());
        var thumbSize = 80;
        var thumb = new ControlThumbnail(this.Pages.Count.toString() + " preview", new VisualState(0, this.Height - thumbSize * this.Height / this.Width, thumbSize, thumbSize * this.Height / this.Width), page);
        page.Thumbnail = thumb;
        page.VisualStates.SetSize(this.Width, this.Height);
        this.AddDXControl(thumb);
        this.Pages.Add(page);
        log("Page added");
        this.VisualStates.SetTextText("");


        thumb.OnClick.Add((s, e) => { s.Parent.AnimateToPage(s.Control); });
        var conSpace = this.Pages.Count * thumb.Width;
        var emptySpace = 0;
        if (this.Pages.Count > 1)
            emptySpace = (this.Pages.Count - 1) * 20;
        var totalSpace = conSpace + emptySpace;

        for (var i = 0; i < this.Pages.Count; i++) {
            var th = this.Pages.InnerList[i].Thumbnail;
            th.VisualStates.SetLeft1(this.Width / 2 - totalSpace / 2 + i * (20 + thumb.Width));
            //log("set left for " + th.Name + ": " + th.Left);
        }
        return page;
    }
    AnimateToPage(page) {
        var curInd = this.Pages.IndexOf(this.CurrentPage);
        var nextInd = this.Pages.IndexOf(page);
        log("Anim " + curInd + " > " + nextInd);
        if (curInd < nextInd) // anim slide to right
        {
            var vs = this.CurrentPage.CurrentVisualState.Clone();
            vs.Left = -this.CurrentPage.VisualStates.NormalVisualState.Width;
            this.CurrentPage.VisualStates.AnimateInto(vs, MixType.EaseInEaseOut, 500);
            vs.OnAnimationComplete.Add((s, e) => {
                log("remove: " + s.Link.Name);
                s.Link.Parent.RemoveDXControl(s.Link);
                s.Link.Parent.GotoPage(page);
                s.Link.Parent.CurrentPage = page;
            });

            page.VisualStates.SetLeft1(this.Width);
            this.AddDXControl(page);
            vs = page.CurrentVisualState.Clone();
            vs.Left = 0;
            page.VisualStates.AnimateInto(vs, MixType.EaseInEaseOut, 500);
        }
        else // anim slide to left
        {
            var vs = this.CurrentPage.CurrentVisualState.Clone();
            vs.Left = this.Width;
            this.CurrentPage.VisualStates.AnimateInto(vs, MixType.EaseInEaseOut, 500);
            vs.OnAnimationComplete.Add((s, e) => {
                s.Link.Parent.RemoveDXControl(s.Link);
                s.Link.Parent.GotoPage(page);
                s.Link.Parent.CurrentPage = page;
            });

            page.VisualStates.SetLeft1(-page.Width);
            this.AddDXControl(page);
            vs = page.CurrentVisualState.Clone();
            vs.Left = 0;
            page.VisualStates.AnimateInto(vs, MixType.EaseInEaseOut, 500);
        }
    }
    GotoPage(page) {
        this.DXControls.Remove(this.CurrentPage);
        this.DXControls.Add(page);
        this.CurrentPage = page;
        return page;
    }
    Feed() {
        for (var i = 0; i < this.Pages.Count; i++)
            this.Pages.InnerList[i].Feed();
    };
}
class ControlThumbnail extends RectangularPatch {
    constructor(name, vs, control) {
        super(name, vs);
        this.Control = control;
        this.VisualStates.SetBorderColor("black");
        this.VisualStates.SetBorderThickness(1);
        //this.VisualStates.SetText(new DXString(name, 20));
        this.ZOrder = 100;
        this.VisualStates.SetFaceColor("white");
        this.VisualStates.SetOpacity(0.5);
        this.VisualStates.MouseHoverState.Opacity = 1;
        this.VisualStates.MouseHoverState.Left -= this.VisualStates.MouseHoverState.Width*2 / 2;
        this.VisualStates.MouseHoverState.Top -= this.VisualStates.MouseHoverState.Height*2 + 10;
        this.VisualStates.MouseHoverState.Width *= 3;
        this.VisualStates.MouseHoverState.Height *= 3;
        this.VisualStates.SetupMouseHoverVS(this.VisualStates.MouseHoverState);
        this.Cursor = Cursors.Hand;
        this.OnMouseEnter.Add((s, e) => { s.ZOrder = 102; });
        this.OnMouseLeave.Add((s, e) => { s.ZOrder = 100; });
    }
    BasePaint(g) {
        super.BasePaint(g);
        var scaleX = this.Width / this.Control.Width;
        var scaleY = this.Height / this.Control.Height;
        g.SetClippingRegion(0, 0, this.Width, this.Height);
        g.ScaleTransform(scaleX, scaleY);
        this.Control.BasePaint(g);
        g.UndoTransform();
        g.ResetClippingRegion();
        //log(this.Name + ": " + this.CurrentVisualState.Left);
    }
}

class WidgetHolder extends RectangularPatch {
    constructor(name, vs) {
        super(name, vs);
        this.Widgets = new List();
        this.VisualStates.SetText(new DXString("You haven not added anything to this page yet", 20, "rgba(150,150,150,1)"));
        this.Thumbnail = null;
    }
    AddWidget(widget) {
        this.Widgets.Add(widget);
        this.AddDXControl(widget);
        this.VisualStates.SetTextText("");
    }
    Feed() {
        for (var i = 0; i < this.Widgets.Count; i++)
            this.Widgets.InnerList[i].Feed();

    }
}
