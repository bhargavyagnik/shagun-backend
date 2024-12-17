import { Request, Response } from 'express';
import {admindb  as db} from '../config/firebase';

interface EventData {
  occasionType: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  upiId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create new event
export const addEvent = async (req: Request, res: Response) => {
  try {
    const { occasionType, brideName, groomName, eventDate, upiId } = req.body;
    const userId = req.user?.uid ;

    const eventData: EventData = {
      occasionType,
      brideName,
      groomName,
      eventDate,
      upiId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('events').add(eventData);
    
    res.status(201).json({
      success: true,
      eventId: docRef.id,
      message: 'Event created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Get single event
export const getEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.uid ;
    const eventDoc = await db.collection('events').doc(eventId).get();
    // Verify ownership
    if (!eventDoc.exists || eventDoc.data()?.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.status(200).json({
      success: true,
      event: { id: eventDoc.id, ...eventDoc.data() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Update event
export const modifyEvent = async (req: Request, res: Response) => {
  try {
    const { eventId, ...updateData } = req.body;
    const userId = req.user?.uid ;

    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership
    if (eventDoc.data()?.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await eventRef.update({
      ...updateData,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event
export const delEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    const userId = 'J2Jv5QE4Q2hjbu7oKCVKBtHkTG93';

    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership
    if (eventDoc.data()?.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await eventRef.delete();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Get all events for a user
// Sample Response
// {
//     "success": true,
//     "events": [
//       {
//         "id": "teGj5THMLWZu0OjeS3ri",
//         "occasionType": "Wedding",
//         "brideName": "Jane Doe",
//         "groomName": "John Smith",
//         "eventDate": "2025-12-31",
//         "upiId": "your_upi_id",
//         "userId": "l3dUVAJDeaSTs6wj0c8SiYFVTj12",
//         "createdAt": {
//           "_seconds": 1734463729,
//           "_nanoseconds": 280000000
//         },
//         "updatedAt": {
//           "_seconds": 1734463729,
//           "_nanoseconds": 280000000
//         }
//       }
//     ]
//   }
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    
    const eventsSnapshot = await db.collection('events')
      .where('userId', '==', userId)
      .get();

    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};
