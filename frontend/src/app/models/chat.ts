export interface Chat {
    id: number;
    participants: number[];
    patient;
    title: string;
    history: History;
}

export interface History {
    count_of_unread_messages: number;
    last_message_time: string;
    top_urgency: number;
}
export interface HistoryForSockets {
    count_of_unread_messages: number;
    top_urgency: number;
    id: number;
}


