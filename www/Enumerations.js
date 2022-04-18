//////////////////////////////////////////////////////////////
////////////         Enumerations      ///////////////////////
//////////////////////////////////////////////////////////////

class Cursors
{
	static Default = 'auto';
    static Arrow = 'auto';
    static IBeam = 'text';
	static SizeWE = 'e-resize';
    static SizeNS = 'n-resize';
    static Hand = 'pointer';
	static Zoom = 'zoom-in';
	static NoMove2D = 'all-scroll';
}

class DXControlBehaviour {
    static None = 0;
    static RadioButton = 1;
}

class ContentAllignment
{
	
	static HorizontalCenter_Overlap = 1;
	static Fill_ImageOnLeft = 2; 
	static Fill_ImageOnRight = 3;
	static Center_ImageOnLeft = 4;
	static Center_ImageOnRight = 5;
	static Left_ImageOnLeft = 6;
	static Center_ImageOnBottom = 7;
	static Center_ImageOnTop = 8;
}
class VisualPresets
{
	static Levitate = 1;
	static EnlargeWithBorder = 2;
	static LevitateWithLight = 3;
}
class AnchorStyles {
    //
    // Summary:
    //     The control is not anchored to any edges of its container.
    static None = 0;
    //
    // Summary:
    //     The control is anchored to the top edge of its container.
    static Top = 1;
    //
    // Summary:
    //     The control is anchored to the bottom edge of its container.
    static Bottom = 2;
    //
    // Summary:
    //     The control is anchored to the left edge of its container.
    static Left = 4;
    //
    // Summary:
    //     The control is anchored to the right edge of its container.
    static Right = 8;
    constructor(val) {
        this.Value = val;
    }
    HasFlag(anchor) {
        return (Value & anchor) == anchor;
    }
}


class MoveOp {
    static None = 0;
    static xZoom = 1;
    static yZoom = 2;
    static xyPan = 3;
    static Zoom = 4;
    static resetScale = 5;
    static goToXZero = 6;
    static ValueUpDown = 7;
    static ValueUpDownFine = 8;
    static selectSeries = 9;

}