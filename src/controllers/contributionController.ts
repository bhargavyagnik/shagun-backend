import { Request, Response } from 'express';
import {admindb  as db} from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// ... existing code ...

export const addContribution = async (req: Request, res: Response) => {
  try {
    const { name, amount, relation, message, eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Add contribution to Firestore
    const contributionRef = await addDoc(collection(db, 'contributions'), {
      name,
      amount: Number(amount),
      relation,
      message,
      eventId,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: 'Contribution added successfully',
      contributionId: contributionRef.id
    });
  } catch (error: any) {
    console.error('Add contribution error:', error);
    res.status(500).json({ 
      message: 'Error adding contribution',
      error: error.message 
    });
  }
};

export const getContributions = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Query contributions for specific event
    const contributionsQuery = query(
      collection(db, 'contributions'),
      where('eventId', '==', eventId)
    );

    const contributionsSnapshot = await getDocs(contributionsQuery);
    const contributions = contributionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      contributions
    });
  } catch (error: any) {
    console.error('Get contributions error:', error);
    res.status(500).json({ 
      message: 'Error fetching contributions',
      error: error.message 
    });
  }
};