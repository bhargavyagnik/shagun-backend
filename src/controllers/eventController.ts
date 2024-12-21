import { Request, Response } from 'express';
import { admindb as db } from '../config/firebase';

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

interface EventWithStats extends EventData {
  id: string;
  totalAmount: number;
  contributionsCount: number;
}

async function getContributionStats(eventId: string) {
  const contributionsSnapshot = await db.collection('events').doc(eventId).collection('contributions').get();
  const contributionsCount = contributionsSnapshot.size;
  const totalAmount = contributionsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().contributionData.amount || 0), 0);
  return { contributionsCount, totalAmount };
}



// Create new event
export const addEvent = async (req: Request, res: Response) => {
  try {
    const { occasionType, brideName, groomName, eventDate, upiId } = req.body;
    const userId = req.user?.uid;

    console.log(`Creating event for user: ${userId}`);

    const eventData: EventData = {
      occasionType,
      brideName,
      groomName,
      eventDate,
      upiId,
      userId: userId || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('events').add(eventData);

    console.log(`Event created successfully with ID: ${docRef.id}`);

    res.status(201).json({
      success: true,
      eventId: docRef.id,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Failed to create event:', (error as Error).message);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: (error as Error).message
    });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.uid;

    console.log(`Fetching event with ID: ${eventId} for user: ${userId}`);

    const eventDoc = await db.collection('events').doc(eventId).get();

    // Verify ownership
    if (!eventDoc.exists || eventDoc.data()?.userId !== userId) {
      console.log(`Event not found or unauthorized access for event ID: ${eventId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Get contribution stats
    const { contributionsCount, totalAmount } = await getContributionStats(eventId);

    const eventWithStats: EventWithStats = {
      id: eventDoc.id,
      ...eventDoc.data() as EventData,
      contributionsCount,
      totalAmount
    };

    console.log(`Event fetched successfully with ID: ${eventId}`);

    res.status(200).json({
      success: true,
      event: eventWithStats
    });
  } catch (error) {
    console.error('Failed to fetch event:', (error as Error).message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: (error as Error).message
    });
  }
};


export const getPublicEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    console.log(`Fetching event with ID: ${eventId}}`);

    const eventDoc = await db.collection('events').doc(eventId).get();

    // Verify ownership
    if (!eventDoc.exists) {
      console.log(`Event not found event ID: ${eventId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    const eventWithStats: EventData = {
      ...eventDoc.data() as EventData,
    };

    console.log(`Event fetched successfully with ID: ${eventId}`);

    res.status(200).json({
      success: true,
      data: eventWithStats
    });
  } catch (error) {
    console.error('Failed to fetch event:', (error as Error).message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: (error as Error).message
    });
  }
};

// Update event
export const modifyEvent = async (req: Request, res: Response) => {
  try {
    const { eventId, ...updateData } = req.body;
    const userId = req.user?.uid;

    console.log(`Updating event with ID: ${eventId} for user: ${userId}`);

    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      console.log(`Event not found with ID: ${eventId}`);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership
    if (eventDoc.data()?.userId !== userId) {
      console.log(`Unauthorized access for event ID: ${eventId}`);
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await eventRef.update({
      ...updateData,
      updatedAt: new Date()
    });

    console.log(`Event updated successfully with ID: ${eventId}`);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Failed to update event:', (error as Error).message);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: (error as Error).message
    });
  }
};

// Delete event
export const delEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    const userId = req.user?.uid;

    console.log(`Deleting event with ID: ${eventId} for user: ${userId}`);

    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      console.log(`Event not found with ID: ${eventId}`);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership
    if (eventDoc.data()?.userId !== userId) {
      console.log(`Unauthorized access for event ID: ${eventId}`);
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await eventRef.delete();

    console.log(`Event deleted successfully with ID: ${eventId}`);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete event:', (error as Error).message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: (error as Error).message
    });
  }
};

// Get all events for a user
export const getAllEvents = async (req: Request, res: Response) => {
  const startTime = performance.now();
  try {
    const userId = req.user?.uid;

    console.log(`Fetching all events for user: ${userId}`);

    const eventsSnapshot = await db.collection('events')
      .where('userId', '==', userId)
      .get();

    // Use Promise.all to fetch contribution stats for all events in parallel
    const eventsWithStats = await Promise.all(
      eventsSnapshot.docs.map(async (doc) => {
        const { contributionsCount, totalAmount } = await getContributionStats(doc.id);
        
        return {
          id: doc.id,
          ...doc.data(),
          contributionsCount,
          totalAmount
        } as EventWithStats;
      })
    );

    console.log(`Fetched ${eventsWithStats.length} events for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: eventsWithStats
    });
  } catch (error) {
    console.error('Failed to fetch events:', (error as Error).message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: (error as Error).message
    });
  }
};