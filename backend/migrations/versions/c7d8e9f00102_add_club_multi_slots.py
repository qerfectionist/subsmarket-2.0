"""Add club multi-slot pricing

Revision ID: c7d8e9f00102
Revises: b6c7d8e9f001
Create Date: 2026-06-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c7d8e9f00102"
down_revision: Union[str, Sequence[str], None] = "b6c7d8e9f001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("clubs", sa.Column("slot_config", postgresql.JSONB(), nullable=True))
    op.add_column("club_members", sa.Column("slot_type", sa.String(length=30), nullable=True))
    op.create_index("ix_club_members_slot_type", "club_members", ["slot_type"])


def downgrade() -> None:
    op.drop_index("ix_club_members_slot_type", table_name="club_members")
    op.drop_column("club_members", "slot_type")
    op.drop_column("clubs", "slot_config")
