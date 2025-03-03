import { Send, Users } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";

const CollaboratorsPanel = () => {
    const { selectedProject } = useProjectStore();
    return (
        <section className="min-w-60 h-full bg-base-300 p-4">
            <header className="flex justify-between bg-primary/30 p-3 rounded-md mb-4">
                <div className="flex-1 text-center">{selectedProject.name}</div>
                <div className="ml-auto pr-4"><Users /></div>
            </header>

            <div className="conversation-area">
                <div className="message-box"></div>
                <div className="inputField">
                    <input className="p-2 w-ful flex" type="text" placeholder="Enter message" />
                    <button><Send /></button>
                </div>
            </div>

            {/* <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full relative">
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full"></span>
                </div>
                <span className="ml-3">User 1</span>
            </div>
            <button className="bg-accent/80 hover:bg-accent/40 p-3 rounded-md w-full">Add Collaborator</button> */}
        </section>
    );
};

export default CollaboratorsPanel;
