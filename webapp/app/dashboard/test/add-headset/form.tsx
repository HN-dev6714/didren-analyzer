'use client';

export function AddHeadsetForm() {

    const VerifyCode = async() => {
        //verifies if code entered matches any of the codes in the database
    }


    return (
    <div className="flex flex-col gap-4 w-full">
        <div>
        <h1 className="text-xl font-bold text-teal-700 text-center">Pair New VR Headset</h1>
        <p className="text-xs text-zinc-600 mt-1 text-center">
            Enter the code shown on the VR Headset Screen:
        </p>
        </div>

        <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-700">Pairing Code</label>
        <input 
            type="text" 
            placeholder="e.g. 12345" 
            maxLength={6}
            className="text-zinc-900 h-10 bg-zinc-200 border border-zinc-800 rounded-lg px-3 text-sm tracking-widest uppercase text-center font-mono focus:outline-none focus:border-teal-500"
        />
        </div>

        <button onClick = {VerifyCode} className="w-full h-10 bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm rounded-lg transition-colors mt-2">
            Verify and Link Device
        </button>
    </div>
    );
}