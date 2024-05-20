//////////////////////////////////////////////////////////////
////////////         DXControl      //////////////////////////
//////////////////////////////////////////////////////////////
class DXControl {
	constructor(name, vs) {
		this.Name = name;
		this.MousePosition = new Point(0, 0);
		this.DXControls = new List();
		this.CanReceiveMouseMove = true;
		this.Parent = null;
		this.sisterControlUnderMouseMove = null;
		this.wentDownInBounds = false;
		this.lastwasOutside = true;
		vs.Link = this;
		this.VisualStates = new VisualStateCollection(vs, this);
		this.VisualStates.Link = this;
		this.Parent = null;
		this.MouseClickAnimation = MixType.Retract;
		this.MouseEnterAnimation = MixType.EaseOut;
		this.hasMouseDownFocus = false;
		this.wentDownAt = new Point(0, 0);
		this.ImageToTextPadding = 0;
		this.Behaviour = DXControlBehaviour.None;
		this.OnMouseMove = new MouseEventHandler();
		this.OnMouseEnter = new MouseEventHandler();
		this.OnMouseLeave = new MouseEventHandler();
		this.OnClick = new MouseEventHandler();
		this.OnMouseDown = new MouseEventHandler();
		this.OnMouseUp = new MouseEventHandler();
		this.CanReceiveMouseClick = true;
		this.Cursor = 'none';
		this.Anchor = new AnchorStyles(AnchorStyles.Left | AnchorStyles.Top);
		this.ZOrder = 0;

		this.OnMouseEnter.Add((sender, e) => {
			//log('OnMouseEnter: ' + this);
			if (sender.Cursor != 'none')
				Canvas.style.cursor = sender.Cursor;
		});
		this.OnMouseLeave.Add((sender, e) => {
			//log('OnMouseLeave: ' + this);
			if (sender.Parent != null) {
				if (sender.Parent.Cursor == 'none')
					Canvas.style.cursor = "auto";
				else Canvas.style.cursor = sender.Parent.Cursor;
			}
			else
				Canvas.style.cursor = "auto";
		});
	}

	/// <summary>
	/// Adds the control to the container.
	/// 1 level Cyclic reference safe
	/// // duplication safe
	/// null ref safe
	/// invokes "added" events
	/// </summary>
	/// <param name="dxc"></param>
	/// <returns></returns>
	AddDXControl(dxc) {
		if (this.Name == "knob")
			log("Control being added to knob!!");
		if (dxc == null)
			return null;
		if (dxc == this)
			return
		if (this.DXControls.Contains(dxc)) return dxc;
		this.DXControls.Add(dxc);

		dxc.AddedToParent(this);
		for (let i = 0; i < this.DXControls.Count; i++) {
			this.DXControls.InnerList[i].AddedToParent(this);
		}
		return dxc;
	}
	/// <summary>
	/// Adds the control to the container.
	/// 1 level Cyclic reference safe
	/// // duplication safe
	/// null ref safe
	/// invokes "added" events
	/// </summary>
	/// <param name="dxc"></param>
	/// <returns></returns>
	RemoveDXControl(dxc) {
		this.DXControls.Remove(dxc);
	}
	AddedToParent(parent) {
		//log("Set Parent: " + parent.Name + " of " + this.Name);
		this.Parent = parent;
		for (var i = 0; i < this.DXControls.Count; i++)
			this.DXControls.InnerList[i].AddedToParent(this);
		this.NotifyOnAdded();
	}
	NotifyOnAdded() { }
	toString() {
		return (this.Parent == null ? "" : (this.Parent.toString() + " > ")) + this.Name;
	}
	get Width() {
		return this.CurrentVisualState.Width;
	}
	get Height() {
		return this.CurrentVisualState.Height;
	}
	get Left() {
		return this.CurrentVisualState.Left;
	}
	get Top() {
		return this.CurrentVisualState.Top;
	}
	get LeftInRotation() {
		var left = this.Left;
		if (Math.abs(Math.round(this.CurrentVisualState.Rotation, 0)) == 90)
			left += this.Width / 2 - this.Height / 2;
		return left;
	}
	get TopInRotation() {
		var top = this.Top;
		if (Math.abs(Math.round(this.CurrentVisualState.Rotation, 0)) == 90)
			top += -this.Width / 2 + this.Height / 2;
		return top;
	}
	get CurrentVisualState() {
		return this.VisualStates.CurrentVisualState;
	}
	get BoundsOnTopParent() {
		var parentL = new Point(0, 0);
		if (this.Parent != null)
			parentL = this.Parent.BoundsOnTopParent.Location;
		return new Rectangle(this.CurrentVisualState.Left + parentL.X, this.CurrentVisualState.Top + parentL.Y, this.CurrentVisualState.Width, this.CurrentVisualState.Height);
	}
	ProcessMouseClick(e, filter) {
		// accept a click only if visible
		if (this.VisualStates.CurrentVisualState.Opacity <= 0.01)
			return false;
		// first ask the children. Don't receive a click if a sub control is receiving it.
		var controls = this.GetDXControlsZOrdered(false);
		if (filter != this)
			for (let i = controls.Count - 1; i >= 0; i--)
				if (controls.InnerList[i].ProcessMouseClick(e, filter))
					return true;
		if ((filter == null || filter == this) && this.CanReceiveMouseClick) {
			if (this.wentDownInBounds == true) {
				if (this.VisualStates.MouseDownState.AllowAutoTransition)
					this.VisualStates.AnimateInto(this.VisualStates.MouseDownState, this.MouseClickAnimation, 100);
				if (Math.sqrt(Math.pow(this.wentDownAt.X - this.MousePosition.X, 2) + Math.Pow(this.wentDownAt.X - this.MousePosition.X, 2)) < 5) {
					log("Click 2: " + this.Name);
					this.NotifyClick(this, e);
				}
				return true;
			}
		}
		return false;
	}
	ProcessMouseDown(e) {
		// devide if we need to receive mouse down and up events.
		if (this.VisualStates.CurrentVisualState.Opacity <= 0.01)
			return null;
		// first ask the children

		var controls = this.GetDXControlsZOrdered(false);
		for (let i = controls.Count - 1; i >= 0; i--) {
			var cr = controls.InnerList[i].ProcessMouseDown(e);
			if (cr != null) {
				this.hasMouseDownFocus = true;
				return cr;
			}
		}
		if (this.TopParentBoundsContains(e.Location) && this.CanReceiveMouseClick) {
			if (this.VisualStates.MouseDownState.AllowAutoTransition) {
				this.VisualStates.AnimateInto(this.VisualStates.MouseDownState, MixType.Linear, 100);
			}
			this.NotifyMouseDown(this, e);
			this.wentDownAt = this.MousePosition;
			this.wentDownInBounds = true;
			this.hasMouseDownFocus = true;
			return this;
		}
		return null;
	}
	ProcessMouseUp(e, filter) {
		var controls = this.GetDXControlsZOrdered(false);
		if (filter != this)
			for (let i = controls.Count - 1; i >= 0; i--)
				controls.InnerList[i].ProcessMouseUp(e, filter);
		if (filter == this || filter == null) {
			if (this.TopParentBoundsContains(e.Location) || this.wentDownInBounds) {
				if (this.VisualStates.MouseDownState.AllowAutoTransition) {
					this.VisualStates.AnimateInto(this.VisualStates.MouseHoverState, MixType.Linear, 100);
				}

				this.NotifyMouseUp(this, e);
				if (Math.sqrt(Math.pow(this.wentDownAt.X - e.X, 2) + Math.pow(this.wentDownAt.Y - e.Y, 2)) < 5) {
					//log("Click 1: " + this.Name);
					this.NotifyClick(this, e);
				}
			}
		}
		this.wentDownInBounds = false;
	}
	ProcessMouseMove(e, filter) {
		this.MousePosition = new Point(e.X, e.Y);
		if (this.TopParentBoundsContains(e) && this.CanReceiveMouseMove) {
			if (this.Parent != null) {
				// before returning, call mouse leave on sister controls that had mouse hover
				if (this.Parent.sisterControlUnderMouseMove != null && this.Parent.sisterControlUnderMouseMove != this) {
					this.Parent.sisterControlUnderMouseMove.NotifyMouseLeave(this.Parent.sisterControlUnderMouseMove, e);
				}
				this.Parent.sisterControlUnderMouseMove = this;
			}
		}
		var controls = this.GetDXControlsZOrdered(false);
		for (let i = controls.Count - 1; i >= 0; i--)
			if (controls.InnerList[i].ProcessMouseMove(e, filter))
				return true;
		this.sisterControlUnderMouseMove = null;
		if (filter == null || filter == this || this.wentDownInBounds) {
			var e2 = new MouseEventArgs(e.X - this.BoundsOnTopParent.X, e.Y - this.BoundsOnTopParent.Y);
			if ((this.TopParentBoundsContains(e.Location) || this.wentDownInBounds) && this.CanReceiveMouseMove) {
				if (this.lastwasOutside) {
					this.lastwasOutside = false;
					if (this.VisualStates.MouseHoverState.AllowAutoTransition) {

						this.VisualStates.AnimateInto(this.VisualStates.MouseHoverState, this.MouseEnterAnimation, 150);
					}
					this.NotifyMouseEnter(this, e2);
				}
				this.NotifyMouseMove(this, e2);
				return true;
			}
			else if (!this.lastwasOutside) {
				this.lastwasOutside = true;
				this.NotifyMouseLeave(this, e2);
				this.NotifyMouseMove(this, e2);
				// don't return true.
			}
		}
		return false;
	}

	ContainsAChild(con) {
		for (c in this.DXControls.ToArray())
			if (c == con)
				return true;
		for (c in this.DXControls.ToArray())
			if (c.ContainsAChild(con))
				return true;
		return false;
	}

	BasePaint(hyg) {
		var controls = this.GetDXControlsZOrdered(false);
		for (let i = 0; i < controls.Count; i++) {
			var control = controls.InnerList[i];
			var x = control.CurrentVisualState.Left;
			var y = control.CurrentVisualState.Top;
			var bkpOp = control.CurrentVisualState.Opacity;
			control.CurrentVisualState.Opacity *= this.CurrentVisualState.Opacity;
			hyg.TranslateTransform(x, y);
			control.BasePaint(hyg);
			hyg.UndoTransform();
			control.CurrentVisualState.Opacity = bkpOp;
			//if (Name == "Inputs container" && i == 7)
			//    break;
		}
	}
	TopParentBoundsContains(point) {
		var X = (this.BoundsOnTopParent.X + this.BoundsOnTopParent.Width / 2);
		var Y = (this.BoundsOnTopParent.Y + this.BoundsOnTopParent.Height / 2);
		var dx = point.X - X, dy = point.Y - Y;
		var th = Math.atan2(dy, dx) - Math.PI / 180 * this.VisualStates.CurrentVisualState.Rotation;
		var r = Math.sqrt(dx * dx + dy * dy);
		var tX = X + r * Math.cos(th);
		var tY = Y + r * Math.sin(th);

		var contains = this.BoundsOnTopParent.Contains(tX, tY);
		if (this.Parent != null)
			if (!this.Parent.BoundsOnTopParent.Contains(tX, tY))
				contains = false;
		return contains;
	}

	NotifyClick(s, e) {
		this.OnClick.Invoke(s, e);
	}
	NotifyMouseEnter(s, e) {
		this.OnMouseEnter.Invoke(s, e);
	}
	NotifyMouseLeave(s, e) {
		this.lastwasOutside = true;
		if (this.VisualStates.NormalVisualState.AllowAutoTransition)
			this.VisualStates.AnimateInto(this.VisualStates.NormalVisualState, MixType.EaseInEaseOut);

		if (this.Cursor != 'none')
			Canvas.style.cursor = this.cursorBkp;
		this.OnMouseLeave.Invoke(s, e);
		this.hasMouseDownFocus = false;
	}
	NotifyMouseDown(s, e) {
		this.OnMouseDown.Invoke(s, e);
	}
	NotifyMouseMove(s, e) {
		this.OnMouseMove.Invoke(s, e);
	}
	NotifyMouseUp(s, e) {
		this.OnMouseUp.Invoke(s, e);
	}

	AllignCentersHorizontally(offset, controls) {
		for (var i = 0; i < controls.Length; i++) {
			var dxc = controls[i];
			dxc.VisualStates.SetTop1(Height / 2 - dxc.Height / 2 - this.Height / 2 + offset);
		}
	}
	/// <summary>
	/// Alligns the centers on a horizontal line that is offset verticall from the center of the current control by the specified amount.
	/// </summary>
	/// <param name="offset"></param>
	/// <param name="controls"></param>
	AbsoluteAllignCentersHorizontally(offset, controls) {
		for (var i = 0; i < controls.Length; i++) {
			var dxc = controls[i];
			dxc.VisualStates.SetTop1(-dxc.Height / 2 + offset);
		}
	}
	/// <summary>
	/// Changes Left to distribute and width to fit horizontally
	/// </summary>
	/// <param name="padding"></param>
	/// <param name="controls"></param>
	DistributeAndFitHorizontally(padding, controls) {
		l = 0;
		w = (this.Width - padding * (controls.Length - 1)) / controls.Length;
		for (var i = 0; i < controls.Length; i++) {
			var c = controls[i];
			c.VisualStates.SetLeft1(l);
			c.VisualStates.SetWidth(w);
			l += w + padding;
		}
	}


	/// <summary>
	/// Alligns the controls on a horizontal line centered on the current control
	/// </summary>
	/// <param name="offset"></param>
	/// <param name="controls"></param>
	CenterAllignCentersHorizontally(offset, controls) {
		AbsoluteAllignCentersHorizontally(offset + Height / 2, controls);
	}
	CenterAllignCentersHorizontally(controls) {
		this.CenterAllignCentersHorizontally(0, controls);
	}
	LeftAllignCentersVertically(offset, controls) {
		for (var i = 0; i < controls.Length; i++) {
			var dxc = controls[i];
			dxc.VisualStates.SetLeft1(dxc.Width / 2 + offset);
		}
	}
	/// <summary>
	///             |
	///       [|||||||||||]
	///             |
	///            [|]
	///         [|||||||]
	///             |
	///           [|||]
	///             |
	/// </summary>
	/// <param name="controls"></param>
	CenterAllignCentersVertically(controls) {
		for (var i = 0; i < controls.Length; i++) {
			var dxc = controls[i];
			dxc.VisualStates.SetLeft1(this.Width / 2 - dxc.Width / 2);
		}
	}
	DistributeHorizontally(controls) {
		this.DistributeHorizontallyAbsolute(controls, this.Width, 0);
	}
	DistributeHorizontallyAbsolute(controls, space, leftOffset) {
		var required = 0;
		for (var i = 0; i < controls.Length; i++)
			required += controls[i].Width;
		var spacing = (space - required) / (controls.Length + 1);
		for (var i = 0; i < controls.Length; i++) {
			var dxc = controls[i];
			dxc.VisualStates.SetLeft1(leftOffset + spacing + (i == 0 ? 0 : controls[i - 1].Right));
		}
	}
	DistributeVertically(controls) {
		var required = 0;
		for (var i = 0; i < controls.Length; i++)
			required += controls[i].Width;
		var spacing = (this.Height - required) / (controls.Length + 1);
		for (var i = 0; i < controls.Length; i++) {
			var dxc = controls[i];
			dxc.VisualStates.SetTop1(spacing + (i == 0 ? 0 : controls[i - 1].Bottom));
		}
	}

	GetDXControlsZOrdered(highestFirst) {
		var out = new List();
		for (var i = 0; i < this.DXControls.Count; i++) {
			out.Add(this.DXControls.InnerList[i]);
		}
		for (var i = 0; i < this.DXControls.Count; i++) {
			for (var j = i + 1; j < this.DXControls.Count; j++) {
				if (highestFirst) {
					if (out.InnerList[j].ZOrder > out.InnerList[i].ZOrder) {
						var t = out.InnerList[i];
						out.InnerList[i] = out.InnerList[j];
						out.InnerList[j] = t;
					}
				}
				else {
					if (out.InnerList[j].ZOrder < out.InnerList[i].ZOrder) {
						var t = out.InnerList[i];
						out.InnerList[i] = out.InnerList[j];
						out.InnerList[j] = t;
					}
				}
			}
		}
		return out;
	}
	SetupBehaviour(b) {
		this.Behaviour = b;
		if (b == DXControlBehaviour.RadioButton) {
			this.VisualStates.SetBorderColor("black");
			this.VisualStates.SetupMouseHover(VisualPresets.EnlargeWithBorder);
			this.VisualStates.SetupMouseClick(VisualPresets.EnlargeWithBorder);
			this.ZOrder = 40; // default Z order
			this.OnClick.Add((s, e) => {
				//log("Click: " + this.Name);
				if (s.Parent == null) {
					log("parent is null.")
				}
				else {
					for (var i = 0; i < s.Parent.DXControls.Count; i++) {
						var rb = s.Parent.DXControls.InnerList[i];
						if (rb.Behaviour == DXControlBehaviour.RadioButton
							&&
							rb.ZOrder == s.ZOrder
							&&
							rb != s) {
							//log("RB: " + rb.Name);
							var vs = rb.CurrentVisualState.Clone();
							vs.BorderThickness = 0.0;
							vs.OnAnimationComplete.Add((s2, e2) => {
								rb.VisualStates.SetBorderThickness(0);
								rb.VisualStates.NormalVisualState.BorderThickness = 0;
								rb.VisualStates.MouseHoverState.BorderThickness = 1;
							});
							rb.VisualStates.AnimateInto(vs, MixType.Linear);
							vs = s.CurrentVisualState.Clone();
							vs.BorderThickness = 1.0;
							vs.OnAnimationComplete.Add((s2, e2) => {
								s.VisualStates.SetBorderThickness(1);
							});
							s.VisualStates.AnimateInto(vs, MixType.Linear);
						}
					}
				}
			});
		}
	}
}