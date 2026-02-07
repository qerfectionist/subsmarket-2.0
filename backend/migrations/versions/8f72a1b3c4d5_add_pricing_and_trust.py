"""Add pricing services and trust events tables

Revision ID: 8f72a1b3c4d5
Revises: 7e69231183c1
Create Date: 2026-02-06 19:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '8f72a1b3c4d5'
down_revision: Union[str, Sequence[str], None] = '29b8fdcd9e75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema with pricing services, trust events, and enhanced user fields."""
    
    # 1. Create pricing_services table for price benchmarks
    op.create_table(
        'pricing_services',
        sa.Column('service_id', sa.String(50), primary_key=True),
        sa.Column('category', sa.String(30), nullable=False),  # streaming, cloud, education, telecom
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('name_kk', sa.String(100), nullable=True),
        sa.Column('logo', sa.String(50), nullable=True),
        sa.Column('family_size', sa.Integer, nullable=False, default=6),
        sa.Column('billing_cycle', sa.String(20), nullable=False, default='monthly'),  # monthly, yearly
        sa.Column('price_min', sa.Integer, nullable=False),
        sa.Column('price_max', sa.Integer, nullable=False),
        sa.Column('price_recommended', sa.Integer, nullable=False),
        sa.Column('regions', postgresql.ARRAY(sa.String(10)), nullable=True),
        sa.Column('region_restriction', sa.Boolean, default=False),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('popularity', sa.Integer, default=50),  # 0-100
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_pricing_services_category', 'pricing_services', ['category'])
    op.create_index('ix_pricing_services_is_active', 'pricing_services', ['is_active'])
    
    # 2. Create telecom_operators table for GB marketplace pricing
    op.create_table(
        'telecom_operators',
        sa.Column('operator_id', sa.String(20), primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('logo', sa.String(50), nullable=True),
        sa.Column('gb_price_min', sa.Integer, nullable=False),
        sa.Column('gb_price_max', sa.Integer, nullable=False),
        sa.Column('gb_price_recommended', sa.Integer, nullable=False),
        sa.Column('gb_min_volume', sa.Integer, default=5),
        sa.Column('popularity', sa.Integer, default=50),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    
    # 3. Create trust_events table for audit trail
    op.create_table(
        'trust_events',
        sa.Column('event_id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),  # deal_completed, complaint_confirmed, etc.
        sa.Column('score_change', sa.Numeric(3, 2), nullable=False),
        sa.Column('score_before', sa.Numeric(3, 2), nullable=False),
        sa.Column('score_after', sa.Numeric(3, 2), nullable=False),
        sa.Column('related_deal_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('ix_trust_events_user_id', 'trust_events', ['user_id'])
    op.create_index('ix_trust_events_event_type', 'trust_events', ['event_type'])
    op.create_index('ix_trust_events_created_at', 'trust_events', ['created_at'])
    
    # 4. Create complaints table
    op.create_table(
        'complaints',
        sa.Column('complaint_id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('reporter_id', sa.Integer, sa.ForeignKey('users.user_id'), nullable=False),
        sa.Column('target_id', sa.Integer, sa.ForeignKey('users.user_id'), nullable=False),
        sa.Column('deal_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('deals.deal_id'), nullable=True),
        sa.Column('reason', sa.String(50), nullable=False),  # fraud, non_payment, spam, other
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('evidence_urls', postgresql.ARRAY(sa.Text), nullable=True),
        sa.Column('status', sa.String(20), default='pending'),  # pending, investigating, confirmed, rejected
        sa.Column('resolved_by', sa.Integer, sa.ForeignKey('users.user_id'), nullable=True),
        sa.Column('resolution_notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
    )
    op.create_index('ix_complaints_status', 'complaints', ['status'])
    op.create_index('ix_complaints_target_id', 'complaints', ['target_id'])
    
    # 5. Create join_requests table for club applications
    op.create_table(
        'join_requests',
        sa.Column('request_id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('club_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clubs.club_id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False),
        sa.Column('message', sa.Text, nullable=True),
        sa.Column('status', sa.String(20), default='pending'),  # pending, approved, rejected
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
        sa.UniqueConstraint('club_id', 'user_id', name='uq_join_requests_club_user'),
    )
    op.create_index('ix_join_requests_status', 'join_requests', ['status'])
    op.create_index('ix_join_requests_club_id', 'join_requests', ['club_id'])
    
    # 6. Add missing columns to users table
    op.add_column('users', sa.Column('phone', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('phone_bank', sa.String(30), default='kaspi'))
    op.add_column('users', sa.Column('recipient_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('badges', postgresql.ARRAY(sa.String(30)), server_default='{}'))
    op.add_column('users', sa.Column('avg_response_time_seconds', sa.Integer, nullable=True))
    op.add_column('users', sa.Column('weekly_deals_count', sa.Integer, default=0))
    
    # 7. Add region column to clubs table
    op.add_column('clubs', sa.Column('region', sa.String(10), nullable=True))
    op.add_column('clubs', sa.Column('recipient_name', sa.String(100), nullable=True))
    op.create_index('ix_clubs_region', 'clubs', ['region'])
    

def downgrade() -> None:
    """Downgrade schema."""
    # Remove added columns
    op.drop_column('clubs', 'recipient_name')
    op.drop_index('ix_clubs_region', table_name='clubs')
    op.drop_column('clubs', 'region')
    
    op.drop_column('users', 'weekly_deals_count')
    op.drop_column('users', 'avg_response_time_seconds')
    op.drop_column('users', 'badges')
    op.drop_column('users', 'recipient_name')
    op.drop_column('users', 'phone_bank')
    op.drop_column('users', 'phone')
    
    # Drop new tables
    op.drop_index('ix_join_requests_club_id', table_name='join_requests')
    op.drop_index('ix_join_requests_status', table_name='join_requests')
    op.drop_table('join_requests')
    
    op.drop_index('ix_complaints_target_id', table_name='complaints')
    op.drop_index('ix_complaints_status', table_name='complaints')
    op.drop_table('complaints')
    
    op.drop_index('ix_trust_events_created_at', table_name='trust_events')
    op.drop_index('ix_trust_events_event_type', table_name='trust_events')
    op.drop_index('ix_trust_events_user_id', table_name='trust_events')
    op.drop_table('trust_events')
    
    op.drop_table('telecom_operators')
    
    op.drop_index('ix_pricing_services_is_active', table_name='pricing_services')
    op.drop_index('ix_pricing_services_category', table_name='pricing_services')
    op.drop_table('pricing_services')
