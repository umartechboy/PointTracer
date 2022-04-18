class Animation {
    constructor() {
        this.Link = null;
        this.Target = null;
        this.Start = null;
        this.Collection = null;
        this.Duration = null;
        this.MixType = null;
        this.Steps = null;
        this.CurrentStep = null;
        this.StartBackup = null;
        this.OnRefreshRequested;
    }
}
class SharedResources {
    constructor() {
        this.Animations = new List();
        this.AnimationsToAdd = new List();
        this.AnimationsToRemove = new List();
    }
    AnimateInto(collection, end, mt, duration) {
        if (this.Animations.Find((anim) => {
            return anim == null ? false : anim.Link == collection.Link;
        }) != null) {
            var previous = this.Animations.Find((anim) => {
                return anim.Link == collection.Link;
            });
            if (previous != null)
                previous.CurrentStep = previous.Steps;
        }
        var anim = new Animation();
        anim.Link = collection.Link;
        anim.Start = collection.CurrentVisualState;
        anim.StartBackup = collection.CurrentVisualState.Clone();
        anim.Target = end;
        anim.Collection = collection;
        anim.Steps = duration / 30;

        anim.MixType = mt;
        anim.CurrentStep = 0;
        this.AnimationsToAdd.Add(anim);
    }
    AnimationLoop() {

        for (var i = 0; i < this.AnimationsToAdd.Count; i++) {
            this.Animations.Add(this.AnimationsToAdd.InnerList[i]);
        }
        this.AnimationsToAdd.Clear();
        for (var i = 0; i < this.AnimationsToRemove.Count; i++) {
            var anim = this.AnimationsToRemove.InnerList[i];
            this.Animations.Remove(anim);
        }
        this.AnimationsToRemove.Clear();
        for (var i = 0; i < this.Animations.Count; i++) {
            var anim = this.Animations.InnerList[i];

            if (anim == null) {
                continue;
            }
            var pi = anim.CurrentStep;
            anim.CurrentStep++;

            if (anim.CurrentStep >= anim.Steps) {
                var newState1 = anim.Target.Clone();
                var dx1 = newState1.Width - anim.Link.CurrentVisualState.Width;
                var dy1 = newState1.Height - anim.Link.CurrentVisualState.Height;
                anim.Collection.IncrementAnchorPositions(dx1, dy1);

                anim.Collection.CurrentVisualState = anim.Target.Clone();
                anim.Target.NotifyAniamtionComplete();
                this.AnimationsToRemove.Add(anim);
                anim.Link.NeedsToRedraw = true;
                continue;
            }
            var p = pi / (anim.Steps - 1);
            if (anim.CurrentStep <= 1)
                p = 0;
            var newState = anim.StartBackup.MixStates(anim.Target, p, anim.MixType);
            //log("Step: " + pi + "/" + anim.Steps + ", text = (" + anim.Target.Text.Text + " - " + newState.Text.Text + " - " + anim.StartBackup.Text.Text + ")");;

            var dx = newState.Width - anim.Link.CurrentVisualState.Width;
            var dy = newState.Height - anim.Link.CurrentVisualState.Height;
            anim.Collection.IncrementAnchorPositions(dx, dy);

            anim.Collection.CurrentVisualState = newState.Clone();

            //if (anim.Link is RectangularPatch)
            //{
            //    var link = (RectangularPatch)anim.Link;
            //    link.NotifySizeIncremented(dx, dy);
            //}
            anim.Target.NotifyAniamtionStep();
            anim.Link.NeedsToRedraw = true;
        }
    }
}
SharedResources = new SharedResources();