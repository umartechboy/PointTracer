//////////////////////////////////////////////////////////////
///////////////         Hardware      ////////////////////////
//////////////////////////////////////////////////////////////

function FloatToArray(value) {
	var bytes = 0;
	switch (value) {
		case Number.POSITIVE_INFINITY: bytes = 0x7F800000; break;
		case Number.NEGATIVE_INFINITY: bytes = 0xFF800000; break;
		case +0.0: bytes = 0x40000000; break;
		case -0.0: bytes = 0xC0000000; break;
		default:
			if (Number.isNaN(value)) { bytes = 0x7FC00000; break; }

			if (value <= -0.0) {
				bytes = 0x80000000;
				value = -value;
			}

			var exponent = Math.floor(Math.log(value) / Math.log(2));
			var significand = ((value / Math.pow(2, exponent)) * 0x00800000) | 0;

			exponent += 127;
			if (exponent >= 0xFF) {
				exponent = 0xFF;
				significand = 0;
			} else if (exponent < 0) exponent = 0;

			bytes = bytes | (exponent << 23);
			bytes = bytes | (significand & ~(-1 << 23));
			break;
	}
	return [(bytes >> 0) & 0xff, (bytes >> 8) & 0xff, (bytes >> 16) & 0xff, (bytes >> 24) & 0xff];
};
function UInt32ToArray(value) {
	return [(value >> 0) & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
};
class PhysLoggerHW {
	constructor() {
		this.Qs = new List();
		this.ValueChangeRequestIndices = new List();
		this.ValueChangeRequestValues = new List();
	}

	Feed(data) {
		for (var i = 0; i < data.length; i++) {

			//log("Feed q" + i + " = " + data[i]);
			this.Qs.InnerList[i].cache = data[i];
			this.Qs.InnerList[i].Value = data[i];
		}
	}
	MakeRemoteRequests(func) {

		var req = Array(this.ValueChangeRequestIndices.Count * (4 + 1));
		for (var i = this.ValueChangeRequestIndices.Count - 1; i >= 0; i--) {
			var ind = this.ValueChangeRequestIndices.InnerList[i];
			var val = this.ValueChangeRequestValues.InnerList[i];
			req[i * (4 + 1)] = ind;
			var bs = FloatToArray(val);
			for (var fi = 0; fi < 4; fi++)
				req[i * (4 + 1) + fi + 1] = bs[fi];
		}
		if (this.ValueChangeRequestIndices.Count > 0) {
			this.ValueChangeRequestIndices.Clear();
			this.ValueChangeRequestValues.Clear();
			log("Value change request: " + req);
			var intbs = UInt32ToArray(req.length - 4);
			for (var fi = 0; fi < 4; fi++)
				req[i] = intbs[i];
			func(req);
		}
	}
}
class LoggerRemoteTerminalQuantity {
	constructor(v) {
		if (v == null)
			v = 0;
		this.Value = v;
		this.cache = 0;
		this.OnDataPacketComplete = new EventHandler();
	}

	invalidate() {

	}

	setValue(value) {
		//log("q.setValue: " + value);
		//this.Value = value;
		//this.cache = value; // if fresh, this will be needed;
		this.OnDataPacketComplete.Invoke();
		var rInd = -1;
		var qInd = HW.Qs.IndexOf(this);
		for (var i = 0; i < HW.ValueChangeRequestIndices.Count; i++)
		{
			if (HW.ValueChangeRequestIndices[i] == qInd)
			{
				rInd = i;
				break;
			}
		}
		if (rInd < 0) {
			rInd = HW.ValueChangeRequestValues.Count;
			HW.ValueChangeRequestIndices.Add(0);
			HW.ValueChangeRequestValues.Add(0);
		}
		HW.ValueChangeRequestIndices.InnerList[rInd] = qInd;
		HW.ValueChangeRequestValues.InnerList[rInd] = value;
	}

	getValue() {
		return this.Value;
	}

	makeValue() {
		return this.Value;
	}
}
var HW = new PhysLoggerHW();