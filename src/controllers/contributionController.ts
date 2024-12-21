import { Request, Response } from 'express';
import { admindb as db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

interface ContributionData {
  name: string,
  amount: Number,
  relation: string,
  message: string,
  createdAt: Date,
}

export const addContribution = async (req: Request, res: Response) => {
  try {
    const { name, amount, relation, message, eventId } = req.body;

    if (!eventId) {
      console.log('Event ID is required');
      return res.status(400).json({ message: 'Event ID is required' });
    }

    console.log(`Adding contribution for event ID: ${eventId}`);

    const contributionData: ContributionData = {
      name,
      amount: Number(amount),
      relation,
      message,
      createdAt: new Date(),
    }

    const contributionRef = await db.collection('events').doc(eventId).collection('contributions').add({ contributionData });

    console.log(`Contribution added successfully with ID: ${contributionRef.id}`);

    res.status(201).json({
      message: 'Contribution added successfully',
      contributionId: contributionRef.id,
      success: true
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
      console.log('Event ID is required');
      return res.status(400).json({ message: 'Event ID is required' });
    }

    console.log(`Fetching contributions for event ID: ${eventId}`);

    // Query contributions for specific event
    const contributionsSnapshot = await db.collection('events').doc(eventId).collection('contributions').get();

    const contributions = contributionsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().contributionData.name,
      amount: doc.data().contributionData.amount,
      relation: doc.data().contributionData.relation,
      message: doc.data().contributionData.message,
      createdAt: doc.data().contributionData.createdAt
    }));

    console.log(`Fetched ${contributions.length} contributions for event ID: ${eventId}`);

    res.json({
      data: contributions
    });
  } catch (error: any) {
    console.error('Get contributions error:', error);
    res.status(500).json({
      message: 'Error fetching contributions',
      error: error.message
    });
  }
};

export const getTotalContributions = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      console.log('Event ID is required');
      return res.status(400).json({ message: 'Event ID is required' });
    }

    console.log(`Calculating total contributions for event ID: ${eventId}`);

    // Only select the amount field to reduce data transfer
    const contributionsSnapshot = await db.collection('events')
      .doc(eventId)
      .collection('contributions')
      .select('amount')  // Only fetch the amount field
      .get();

    // Use a simple for...of loop which is faster than reduce for this case
    let totalAmount = 0;
    for (const doc of contributionsSnapshot.docs) {
      totalAmount += doc.data().amount || 0;
    }

    console.log(`Total contributions for event ID: ${eventId} is ${totalAmount}`);

    res.json({
      eventId,
      totalAmount
    });
  } catch (error: any) {
    console.error('Get total contributions error:', error);
    res.status(500).json({
      message: 'Error calculating total contributions',
      error: error.message
    });
  }
};