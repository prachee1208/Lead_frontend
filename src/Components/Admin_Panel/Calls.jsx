import { useState } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User, Clock, Calendar, Check, X, ChevronDown } from "lucide-react";

export default function CallComponent() {
  const [callActive, setCallActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setCallActive(true);
    // In a real app, you'd initiate the actual call here
    // Start timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Store timer ID to clear it later
    window.callTimerId = timer;
  };

  const handleEndCall = () => {
    setCallActive(false);
    // Clear timer
    clearInterval(window.callTimerId);
    setShowNotes(true);
  };

  const handleSaveNotes = () => {
    // In a real app, you'd save notes to your backend
    setShowNotes(false);
    setCallDuration(0);
    setNotes("");
    setCallOutcome("");
  };

  const currentLead = {
    name: "Sarah Johnson",
    company: "Acme Technologies",
    position: "CTO",
    phone: "+1 (555) 123-4567",
    lastContact: "March 30, 2025",
    status: "Interested",
    priority: "High"
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Lead Info Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentLead.name}</h2>
            <p className="text-gray-600">{currentLead.position} at {currentLead.company}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentLead.priority === "High" ? "bg-red-100 text-red-800" : 
              currentLead.priority === "Medium" ? "bg-yellow-100 text-yellow-800" : 
              "bg-green-100 text-green-800"
            }`}>
              {currentLead.priority} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentLead.status === "Interested" ? "bg-blue-100 text-blue-800" : 
              currentLead.status === "Not Interested" ? "bg-gray-100 text-gray-800" : 
              "bg-purple-100 text-purple-800"
            }`}>
              {currentLead.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Call Interface */}
      <div className="p-6">
        {!callActive && !showNotes ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={48} className="text-gray-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">{currentLead.name}</h3>
              <p className="text-gray-600">{currentLead.phone}</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-1" />
              <span>Last contacted: {currentLead.lastContact}</span>
            </div>
            <button
              onClick={handleStartCall}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <Phone size={24} />
            </button>
            <p className="text-gray-500 text-sm">Click to start call</p>
          </div>
        ) : callActive ? (
          <div className="flex flex-col items-center justify-center space-y-8 py-12">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-300">
              <User size={64} className="text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium">{currentLead.name}</h3>
              <p className="text-gray-600">{currentLead.phone}</p>
              <div className="mt-2 text-blue-600 font-medium text-lg">{formatTime(callDuration)}</div>
            </div>
            <div className="flex space-x-8">
              <button
                onClick={() => setMuted(!muted)}
                className={`rounded-full p-3 transition-colors focus:outline-none ${
                  muted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {muted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`rounded-full p-3 transition-colors focus:outline-none ${
                  !speakerOn ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {speakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={handleEndCall}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        ) : showNotes ? (
          <div className="space-y-4 py-6">
            <h3 className="text-lg font-medium">Call Summary</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Duration</label>
                <div className="text-gray-800 bg-gray-50 px-4 py-2 rounded-md border">
                  {formatTime(callDuration)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Outcome</label>
                <div className="relative">
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an outcome</option>
                    <option value="scheduled_meeting">Scheduled a Meeting</option>
                    <option value="interested">Interested - Follow Up</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="no_answer">No Answer</option>
                    <option value="wrong_number">Wrong Number</option>
                    <option value="call_back">Call Back Later</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Enter details about the conversation..."
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSaveNotes}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center justify-center"
              >
                <Check size={16} className="mr-2" />
                Save and Close
              </button>
              <button
                onClick={() => {
                  setShowNotes(false);
                  setCallDuration(0);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center justify-center"
              >
                <X size={16} className="mr-2" />
                Discard
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Timeline and Quick Actions */}
      {!callActive && !showNotes && (
        <div className="bg-gray-50 p-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
          <div className="space-y-2">
            <div className="flex items-start text-sm">
              <Calendar size={14} className="text-gray-500 mt-0.5 mr-2" />
              <div>
                <p className="text-gray-800">Email sent regarding product demo</p>
                <p className="text-gray-500 text-xs">April 8, 2025</p>
              </div>
            </div>
            <div className="flex items-start text-sm">
              <Phone size={14} className="text-gray-500 mt-0.5 mr-2" />
              <div>
                <p className="text-gray-800">Missed call - no voicemail</p>
                <p className="text-gray-500 text-xs">March 30, 2025</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}