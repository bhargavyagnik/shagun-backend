import { Request, Response } from 'express';
import {admindb  as db} from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

interface ContributionData{
  name:string,
  amount:Number,
  relation:string,
  message:string,
  createdAt:Date,
}

export const addContribution = async (req: Request, res: Response) => {
  try {
    const { name, amount, relation, message, eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }
    const contributionData : ContributionData={
      name,
      amount: Number(amount),
      relation,
      message,
      createdAt: new Date(),
    }

    const contributionRef = await db.collection('events').doc(eventId).collection('contributions').add({contributionData});

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
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // Query contributions for specific event
    const contributionsSnapshot = await db.collection('events').doc(eventId).collection('contributions').get();

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

export const getTotalContributions = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

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
